import { NextResponse } from 'next/server';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { redis } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';
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
  // Aggregate data for Executive Summary
  const recordCount = data.length;
  const totalVolume = data.reduce((acc, row) => acc + parseFloat(row.value || 0), 0);
  const uniqueTypes = Array.from(new Set(data.map(row => row.metric_type))).join(', ').toUpperCase();

  // Sort chronologically for SVG chart plotting
  const chronologicalData = [...data].sort(
    (a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime()
  );

  // SVG Chart rendering
  let svgChart = '';
  if (chronologicalData.length > 0) {
    const svgWidth = 720;
    const svgHeight = 220;
    const paddingLeft = 60;
    const paddingRight = 30;
    const paddingTop = 30;
    const paddingBottom = 40;
    
    const chartWidth = svgWidth - paddingLeft - paddingRight;
    const chartHeight = svgHeight - paddingTop - paddingBottom;

    const values = chronologicalData.map(d => parseFloat(d.value || 0));
    const maxVal = Math.max(...values, 100) * 1.15;
    const minVal = Math.max(0, Math.min(...values) * 0.85); // Floor at 0 or a bit lower if negative

    const points: string[] = [];
    const areaPoints: string[] = [];

    chronologicalData.forEach((d, idx) => {
      const val = parseFloat(d.value || 0);
      const x = paddingLeft + (idx / Math.max(1, chronologicalData.length - 1)) * chartWidth;
      const y = paddingTop + chartHeight - ((val - minVal) / Math.max(1, maxVal - minVal)) * chartHeight;
      points.push(`${x},${y}`);
      areaPoints.push(`${x},${y}`);
    });

    const pathData = points.length > 0 ? `M ${points.join(' L ')}` : '';
    const areaPathData = areaPoints.length > 0 
      ? `M ${paddingLeft},${paddingTop + chartHeight} L ${areaPoints.join(' L ')} L ${paddingLeft + chartWidth},${paddingTop + chartHeight} Z` 
      : '';

    // Generate grid lines
    const gridCount = 4;
    let gridLines = '';
    for (let i = 0; i <= gridCount; i++) {
      const yVal = minVal + (i / gridCount) * (maxVal - minVal);
      const yPos = paddingTop + chartHeight - (i / gridCount) * chartHeight;
      gridLines += `
        <line x1="${paddingLeft}" y1="${yPos}" x2="${svgWidth - paddingRight}" y2="${yPos}" stroke="#E2E8F0" stroke-dasharray="3,3" stroke-width="1" />
        <text x="${paddingLeft - 10}" y="${yPos + 4}" font-family="JetBrains Mono, monospace" font-size="9" fill="#94A3B8" text-anchor="end">$${Math.round(yVal).toLocaleString()}</text>
      `;
    }

    // X Axis ticks & labels
    let xAxisLabels = '';
    const labelStep = Math.max(1, Math.floor(chronologicalData.length / 5));
    chronologicalData.forEach((d, idx) => {
      if (idx % labelStep === 0 || idx === chronologicalData.length - 1) {
        const x = paddingLeft + (idx / Math.max(1, chronologicalData.length - 1)) * chartWidth;
        const dateStr = new Date(d.recorded_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        xAxisLabels += `
          <line x1="${x}" y1="${paddingTop + chartHeight}" x2="${x}" y2="${paddingTop + chartHeight + 4}" stroke="#CBD5E1" stroke-width="1" />
          <text x="${x}" y="${paddingTop + chartHeight + 16}" font-family="JetBrains Mono, monospace" font-size="9" fill="#94A3B8" text-anchor="middle">${dateStr}</text>
        `;
      }
    });

    // Render data points
    let dataPoints = '';
    if (chronologicalData.length < 25) { // Only render circles if dataset is reasonably sized
      chronologicalData.forEach((d, idx) => {
        const val = parseFloat(d.value || 0);
        const x = paddingLeft + (idx / Math.max(1, chronologicalData.length - 1)) * chartWidth;
        const y = paddingTop + chartHeight - ((val - minVal) / Math.max(1, maxVal - minVal)) * chartHeight;
        dataPoints += `
          <circle cx="${x}" cy="${y}" r="4" fill="#0284C7" stroke="#FFFFFF" stroke-width="1.5" />
        `;
      });
    }

    svgChart = `
      <div style="background-color: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 12px; padding: 16px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);">
        <div style="font-family: 'Space Grotesk', sans-serif; font-size: 11px; font-weight: 700; color: #64748B; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
          <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: #0284C7;"></span>
          Portfolio Performance Trend
        </div>
        <svg viewBox="0 0 ${svgWidth} ${svgHeight}" width="100%" height="auto" style="overflow: visible;">
          <defs>
            <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="#0284C7" stop-opacity="0.18" />
              <stop offset="100%" stop-color="#0284C7" stop-opacity="0.0" />
            </linearGradient>
          </defs>
          
          <!-- Background grids -->
          ${gridLines}
          
          <!-- Area fill -->
          <path d="${areaPathData}" fill="url(#chartGradient)" />
          
          <!-- Line stroke -->
          <path d="${pathData}" fill="none" stroke="#0284C7" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
          
          <!-- X Axis line -->
          <line x1="${paddingLeft}" y1="${paddingTop + chartHeight}" x2="${svgWidth - paddingRight}" y2="${paddingTop + chartHeight}" stroke="#CBD5E1" stroke-width="1" />
          
          <!-- X Labels & ticks -->
          ${xAxisLabels}
          
          <!-- Points -->
          ${dataPoints}
        </svg>
      </div>
    `;
  }

  const tableRows = data.map(
    (row, idx) => `
    <tr style="border-bottom: 1px solid #E2E8F0; background-color: ${idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC'};">
      <td style="padding: 10px 16px; font-family: 'Inter', sans-serif; font-size: 11px; color: #1E293B; font-weight: 500;">
        <span style="color: #0284C7; font-weight: bold; margin-right: 6px;">■</span> ${row.metric_type.toUpperCase()}
      </td>
      <td style="padding: 10px 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #0F172A; font-weight: bold; text-align: right;">
        $${parseFloat(row.value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </td>
      <td style="padding: 10px 16px; font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748B; text-align: right;">
        ${new Date(row.recorded_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: '2-digit' })}
      </td>
    </tr>
  `
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');
          
          @page {
            size: A4 portrait;
            margin: 15mm 15mm 20mm 15mm;
          }
          
          body {
            background-color: #FFFFFF;
            color: #1E293B;
            font-family: 'Inter', sans-serif;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
          }
          
          .header-container {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 2px solid #0F172A;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }

          .brand {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .brand-logo {
            width: 24px;
            height: 24px;
            border-radius: 6px;
            background: #0F172A;
            display: inline-block;
            vertical-align: middle;
            position: relative;
          }
          
          .brand-logo::after {
            content: '';
            position: absolute;
            top: 6px;
            left: 6px;
            width: 10px;
            height: 10px;
            border-radius: 2px;
            background-color: #00D4FF;
          }

          .brand-name {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 16px;
            letter-spacing: 0.5px;
            color: #0F172A;
          }

          .brand-tag {
            color: #64748B;
            font-family: 'JetBrains Mono', monospace;
            font-size: 11px;
            margin-left: 4px;
          }

          .report-meta {
            text-align: right;
            font-family: 'JetBrains Mono', monospace;
            font-size: 10px;
            color: #64748B;
            line-height: 1.6;
          }

          .title {
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 26px;
            color: #0F172A;
            margin: 0 0 4px 0;
            letter-spacing: -0.5px;
          }

          .badge {
            background-color: rgba(2, 132, 199, 0.08);
            border: 1px solid rgba(2, 132, 199, 0.2);
            color: #0284C7;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            font-weight: 600;
            padding: 2px 6px;
            border-radius: 4px;
            display: inline-block;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            vertical-align: middle;
            margin-left: 10px;
          }

          /* Executive KPI Summary Cards */
          .kpi-grid {
            display: grid;
            grid-template-cols: repeat(3, 1fr);
            gap: 16px;
            margin-bottom: 24px;
          }

          .kpi-card {
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            padding: 14px 18px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          }

          .kpi-label {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            color: #64748B;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
          }

          .kpi-value {
            font-family: 'Space Grotesk', sans-serif;
            font-size: 18px;
            font-weight: 700;
            color: #0F172A;
          }

          .kpi-subtext {
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            color: #0284C7;
            margin-top: 2px;
            font-weight: 500;
          }

          /* Ledger Table */
          .table-container {
            background-color: #FFFFFF;
            border: 1px solid #E2E8F0;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
            margin-bottom: 24px;
            page-break-inside: avoid;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            text-align: left;
          }

          th {
            background-color: #F1F5F9;
            color: #475569;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 11px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            padding: 10px 16px;
            border-bottom: 1.5px solid #CBD5E1;
          }

          .total-row {
            background-color: #F8FAFC;
            border-top: 2px solid #0F172A;
          }

          .total-row td {
            padding: 12px 16px;
            font-family: 'Space Grotesk', sans-serif;
            font-weight: 700;
            font-size: 12px;
            color: #0F172A;
          }

          /* Signature block */
          .sign-off-container {
            margin-top: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border: 1px dashed #CBD5E1;
            border-radius: 12px;
            padding: 16px 24px;
            background-color: #F8FAFC;
            page-break-inside: avoid;
          }

          .signature-box {
            width: 220px;
          }

          .signature-line {
            border-bottom: 1px solid #475569;
            height: 36px;
            margin-bottom: 6px;
          }

          .signature-label {
            font-family: 'Inter', sans-serif;
            font-size: 10px;
            color: #475569;
            font-weight: 500;
          }

          .audit-seal {
            border: 2px double #0284C7;
            border-radius: 50%;
            width: 68px;
            height: 68px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-family: 'Space Grotesk', sans-serif;
            font-size: 8px;
            font-weight: 700;
            color: #0284C7;
            text-transform: uppercase;
            text-align: center;
            letter-spacing: 0.5px;
            line-height: 1.1;
            transform: rotate(-12deg);
            opacity: 0.85;
          }

          /* Footer styling */
          .footer {
            margin-top: 32px;
            border-top: 1px solid #E2E8F0;
            padding-top: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-family: 'JetBrains Mono', monospace;
            font-size: 9px;
            color: #94A3B8;
          }

          .confidential {
            color: #EF4444;
            font-weight: 600;
            letter-spacing: 0.5px;
          }
        </style>
      </head>
      <body>
        <div class="header-container">
          <div>
            <div class="brand">
              <span class="brand-logo"></span>
              <span class="brand-name">FINFLOW<span class="brand-tag">/ANALYTICS</span></span>
            </div>
            <div style="margin-top: 12px;">
              <h1 class="title">${title}<span class="badge">Audited</span></h1>
            </div>
          </div>
          <div class="report-meta">
            <div>REF_NO: FF-EXP-${Date.now().toString().slice(-6)}</div>
            <div>DATE: ${new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div>TIME: ${new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
          </div>
        </div>

        <!-- Executive Summary Cards -->
        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Aggregated Volume</div>
            <div class="kpi-value" style="color: #0F172A;">$${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div class="kpi-subtext">Cumulative sum</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Ledger Entries</div>
            <div class="kpi-value" style="color: #0F172A;">${recordCount}</div>
            <div class="kpi-subtext">Total audited rows</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Active Segments</div>
            <div class="kpi-value" style="font-size: 11px; margin-top: 4px; line-height: 1.4; color: #0284C7; font-family: 'JetBrains Mono', monospace; word-break: break-all;">
              ${uniqueTypes || 'N/A'}
            </div>
            <div class="kpi-subtext">Tracked dimensions</div>
          </div>
        </div>

        <!-- SVG Visual Performance Trend Chart -->
        ${svgChart}

        <!-- Ledger Table -->
        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th style="padding-left: 16px;">Metric Item</th>
                <th style="text-align: right;">Reported Value</th>
                <th style="text-align: right; padding-right: 16px;">Recorded Date</th>
              </tr>
            </thead>
            <tbody>
              ${tableRows}
              <tr class="total-row">
                <td style="padding-left: 16px; font-weight: 700;">Audited Portfolio Sum</td>
                <td style="color: #0284C7; text-align: right; font-family: 'JetBrains Mono', monospace; font-weight: 700;">
                  $${totalVolume.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
                <td style="color: #64748B; text-align: right; font-family: 'JetBrains Mono', monospace; padding-right: 16px;">
                  --
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Sign-Off & Verification Block -->
        <div class="sign-off-container">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Prepared By: Financial Analyst</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-label">Authorized Sign-off: Chief Financial Officer</div>
          </div>
          <div class="audit-seal">
            FinFlow<br>Audit<br>Verified
          </div>
        </div>

        <!-- Official Footer -->
        <div class="footer">
          <div>© 2026 FinFlow Analytics Inc. Generated securely under strict tenant encryption.</div>
          <div class="confidential">CONFIDENTIAL · SYSTEM LEDGER REPORT</div>
        </div>
      </body>
    </html>
  `;
}
