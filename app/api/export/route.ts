import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/redis/client';
import { pool } from '@/lib/db/client';
import { hasPermission } from '@/lib/auth/rbac';
import { generateCsv } from '@/lib/export/csv';
import { generateExcel } from '@/lib/export/excel';
import { generateReportPdf } from '@/lib/export/pdf';
import { uploadExport } from '@/lib/aws/s3';
import { sendExportEmail } from '@/lib/aws/ses';

const exportRequestSchema = z.object({
  reportId: z.string().uuid().optional(),
  format: z.enum(['pdf', 'csv', 'excel']),
  title: z.string().default('Financial Report'),
  filters: z.object({
    types: z.array(z.string()).optional(),
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    const orgId = request.headers.get('x-org-id');
    const userRole = request.headers.get('x-user-role') as any;
    const userId = request.headers.get('x-user-id');

    if (!orgId || !userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = exportRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid parameters.', details: parsed.error.format() }, { status: 400 });
    }

    const { reportId, format, filters, title } = parsed.data;

    // Enforce Permission Check
    const requiredPermission = format === 'pdf' ? 'export:pdf' : 'export:raw';
    if (!hasPermission(userRole, requiredPermission)) {
      return NextResponse.json({ success: false, error: `Forbidden. Role '${userRole}' lacks permission '${requiredPermission}'.` }, { status: 403 });
    }

    // 1. Initialize background job record in Redis
    const jobId = uuidv4();
    const jobKey = `job:${jobId}`;
    const jobData = {
      id: jobId,
      status: 'queued',
      format,
      title,
      progress: 0,
      url: null,
      created_at: new Date().toISOString(),
    };

    await redis.set(jobKey, JSON.stringify(jobData), 'EX', 86400); // Retain tracking state for 24 hours

    // 2. Launch Background Exporter Process
    setImmediate(async () => {
      try {
        console.log(`[Export Job ${jobId}] Commencing background compilation: ${format}`);
        
        // Update state to processing
        jobData.status = 'processing';
        jobData.progress = 10;
        await redis.set(jobKey, JSON.stringify(jobData), 'EX', 86400);

        // Fetch metrics data from database using RLS isolation
        const fromDate = filters?.from ? new Date(filters.from) : new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        const toDate = filters?.to ? new Date(filters.to) : new Date();
        const types = filters?.types || ['mrr', 'arr', 'churn', 'dau', 'revenue', 'expense', 'profit'];

        const client = await pool.connect();
        let dbRows: any[] = [];
        try {
          await client.query('BEGIN');
          await client.query(`SELECT set_config('app.current_org_id', $1, true)`, [orgId]);
          const queryRes = await client.query(
            `SELECT metric_type, value, recorded_at 
             FROM financial_metrics
             WHERE metric_type = ANY($1) AND recorded_at BETWEEN $2 AND $3
             ORDER BY recorded_at DESC`,
            [types, fromDate, toDate]
          );
          dbRows = queryRes.rows;
          await client.query('COMMIT');
        } catch (dbErr) {
          await client.query('ROLLBACK');
          throw dbErr;
        } finally {
          client.release();
        }

        jobData.progress = 40;
        await redis.set(jobKey, JSON.stringify(jobData), 'EX', 86400);

        // Fetch User Email for dispatch
        const userRes = await pool.query(`SELECT email FROM users WHERE id = $1`, [userId]);
        const emailAddress = userRes.rows[0]?.email || 'reports@finflow.io';

        // 3. Compile Buffer based on Format
        let buffer: Buffer;
        let contentType: string;
        let ext: string;

        if (format === 'csv') {
          buffer = await generateCsv(dbRows);
          contentType = 'text/csv';
          ext = 'csv';
        } else if (format === 'excel') {
          buffer = await generateExcel(dbRows, title);
          contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
          ext = 'xlsx';
        } else {
          // PDF Report
          const htmlContent = compileReportHtml(title, dbRows);
          buffer = await generateReportPdf(htmlContent);
          contentType = 'application/pdf';
          ext = 'pdf';
        }

        jobData.progress = 70;
        await redis.set(jobKey, JSON.stringify(jobData), 'EX', 86400);

        // 4. Upload generated buffer to S3 / Local storage
        const filename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '-')}.${ext}`;
        const { signedUrl } = await uploadExport(buffer, filename, contentType);

        jobData.progress = 90;
        await redis.set(jobKey, JSON.stringify(jobData), 'EX', 86400);

        // 5. Dispatch confirmation email with download link
        await sendExportEmail(emailAddress, signedUrl, title, format);

        // 6. Complete Job Record
        jobData.status = 'done';
        jobData.progress = 100;
        jobData.url = signedUrl as any;
        await redis.set(jobKey, JSON.stringify(jobData), 'EX', 86400);
        
        console.log(`[Export Job ${jobId}] Export compilation completed successfully.`);
      } catch (err: any) {
        console.error(`[Export Job ${jobId}] Execution failed:`, err);
        jobData.status = 'error';
        await redis.set(jobKey, JSON.stringify(jobData), 'EX', 86400);
      }
    });

    return NextResponse.json({ success: true, jobId }, { status: 202 });
  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * Builds a styled HTML report page for PDF printing
 */
function compileReportHtml(title: string, data: any[]): string {
  const tableRows = data.map(
    (row) => `
    <tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">
      <td style="padding: 10px; font-family: monospace; color: #7A8BA0;">${row.metric_type.toUpperCase()}</td>
      <td style="padding: 10px; font-family: monospace; color: #E8EDF5; text-align: right;">$${parseFloat(row.value).toLocaleString()}</td>
      <td style="padding: 10px; font-family: monospace; color: #7A8BA0; text-align: right;">${new Date(row.recorded_at).toLocaleDateString()}</td>
    </tr>
  `
  ).join('');

  return `
    <html>
      <head>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700&family=Inter&display=swap');
          body {
            background-color: #080C14;
            color: #E8EDF5;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 30px;
          }
          .header {
            border-bottom: 2px solid #00D4FF;
            padding-bottom: 20px;
            margin-bottom: 40px;
          }
          .title {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 28px;
            color: #E8EDF5;
            margin: 0;
          }
          .subtitle {
            font-size: 14px;
            color: #7A8BA0;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th {
            background-color: #0D1321;
            color: #00D4FF;
            font-family: 'Space Grotesk', sans-serif;
            text-align: left;
            padding: 12px;
            border-bottom: 1px solid #1A2235;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1 class="title">${title}</h1>
          <div class="subtitle">FinFlow Analytics Compiled Report · Generated ${new Date().toLocaleString()}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Metric Item</th>
              <th style="text-align: right;">Reported Value</th>
              <th style="text-align: right;">Recorded Date</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </body>
    </html>
  `;
}
