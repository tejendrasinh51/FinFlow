import { NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/db/client';
import { sendExportEmail } from '@/lib/aws/ses';

export const dynamic = 'force-dynamic';

const requestAccessSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  orgName: z.string().min(2).max(100),
  note: z.string().max(500).optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = requestAccessSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid parameters. Please fill in all fields correctly.' }, { status: 400 });
    }

    const { name, email, orgName, note } = parsed.data;

    // 1. Record the request in the audit logs database
    await query(
      `INSERT INTO audit_log (org_id, user_id, action, ip_address) 
       VALUES (null, null, $1, $2)`,
      [
        `Access requested: ${name} (${email}) for Organisation '${orgName}'. Note: ${note || 'none'}`,
        request.headers.get('x-forwarded-for') || '127.0.0.1'
      ]
    );

    // 2. Dispatch a notification email to the administrator
    const adminEmail = 'admin@finflow.io';
    const manageUsersUrl = '/dashboard/users';
    
    await sendExportEmail(
      adminEmail,
      manageUsersUrl,
      `Access Request from ${name}`,
      `new user application: ${orgName}`
    );

    return NextResponse.json({
      success: true,
      message: 'Access request successfully recorded. Administrators have been notified.'
    });
  } catch (error) {
    console.error('Request access API error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
