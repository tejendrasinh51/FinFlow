import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import fs from 'fs';
import path from 'path';

const region = process.env.AWS_REGION || 'us-east-1';
const fromEmail = process.env.AWS_SES_FROM_EMAIL || 'reports@finflow.io';

const hasAwsKeys = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

let sesClient: SESClient | null = null;
if (hasAwsKeys) {
  try {
    sesClient = new SESClient({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  } catch (err) {
    console.error('Failed to initialize SES client:', err);
  }
}

/**
 * Dispatches an email containing the generated financial export download link.
 * Falls back to local filesystem log output if AWS SES is not configured.
 */
export async function sendExportEmail(
  to: string,
  downloadUrl: string,
  reportTitle: string,
  format: string
): Promise<void> {
  const finalDownloadUrl = downloadUrl.startsWith('http') 
    ? downloadUrl 
    : `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}${downloadUrl}`;

  const subject = `Your FinFlow Export is Ready: ${reportTitle}`;
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #080C14; color: #E8EDF5; border-radius: 12px; border: 1px solid #1A2235;">
      <h2 style="color: #00D4FF; font-family: 'Space Grotesk', sans-serif;">FinFlow Analytics</h2>
      <p style="font-size: 16px; line-height: 1.5; color: #7A8BA0;">
        Hello,
      </p>
      <p style="font-size: 16px; line-height: 1.5; color: #E8EDF5;">
        Your requested report export of <strong>${reportTitle}</strong> (Format: <strong>${format.toUpperCase()}</strong>) has completed successfully.
      </p>
      <div style="margin: 30px 0; text-align: center;">
        <a href="${finalDownloadUrl}" style="background-color: #00D4FF; color: #080C14; text-decoration: none; padding: 12px 24px; font-weight: bold; border-radius: 6px; font-size: 16px; display: inline-block;">
          Download Exported File
        </a>
      </div>
      <p style="font-size: 12px; color: #3A4A5C; line-height: 1.5; margin-top: 40px; border-top: 1px solid #1A2235; padding-top: 20px;">
        This download link will expire in 1 hour. If you did not request this file, please ignore this email.<br/>
        © 2026 FinFlow Analytics · Enterprise Financial Intelligence
      </p>
    </div>
  `;

  if (sesClient) {
    try {
      const command = new SendEmailCommand({
        Source: fromEmail,
        Destination: {
          ToAddresses: [to],
        },
        Message: {
          Subject: { Data: subject, Charset: 'UTF-8' },
          Body: {
            Html: { Data: htmlBody, Charset: 'UTF-8' },
          },
        },
      });

      await sesClient.send(command);
      console.log(`Successfully dispatched SES email invitation to: ${to}`);
      return;
    } catch (err) {
      console.error('AWS SES mail dispatch failed. Falling back to local logging:', err);
    }
  }

  // ── Local simulated outbox fallback ─────────────────
  try {
    const outboxDir = path.join(process.cwd(), 'temp', 'outbox');
    if (!fs.existsSync(outboxDir)) {
      fs.mkdirSync(outboxDir, { recursive: true });
    }

    const timestamp = Date.now();
    const mailFile = path.join(outboxDir, `${timestamp}-export-mail-${to.replace(/[@.]/g, '-')}.html`);
    fs.writeFileSync(mailFile, htmlBody);
    
    console.log(`[SES Simulation] Export email logged locally. Check: ${mailFile}`);
  } catch (err) {
    console.error('Failed to log simulated email outbox:', err);
  }
}
