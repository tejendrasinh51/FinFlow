import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl as getS3SignedUrl } from '@aws-sdk/s3-request-presigner';
import fs from 'fs';
import path from 'path';

const region = process.env.AWS_REGION || 'us-east-1';
const bucketName = process.env.AWS_S3_EXPORT_BUCKET || 'finflow-exports';

// Determine if AWS is configured
const hasAwsKeys = !!(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

let s3Client: S3Client | null = null;
if (hasAwsKeys) {
  try {
    s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  } catch (err) {
    console.error('Failed to initialize S3 Client. Falling back to local file storage.', err);
  }
} else {
  console.warn('AWS Credentials missing in environment. Activating public filesystem local exports fallback.');
}

/**
 * Uploads a buffer export. If AWS credentials are provided, saves it to S3.
 * Otherwise, stores it in Next.js's public local directory.
 */
export async function uploadExport(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<{ key: string; signedUrl: string }> {
  const timestamp = Date.now();
  const uniqueName = `${timestamp}-${filename}`;

  if (s3Client) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: uniqueName,
        Body: buffer,
        ContentType: contentType,
      });

      await s3Client.send(command);
      
      // Generate pre-signed URL (1-hour expiry)
      const signedUrl = await getS3SignedUrl(s3Client, command, { expiresIn: 3600 });
      return { key: uniqueName, signedUrl };
    } catch (err) {
      console.error('AWS S3 upload failed. Reverting to local fallback:', err);
    }
  }

  // ── Local Filesystem Fallback ──────────────────────
  let localUrl = '';
  try {
    const base64Data = buffer.toString('base64');
    localUrl = `data:${contentType};base64,${base64Data}`;

    const exportsDir = path.join(process.cwd(), 'public', 'exports');
    
    // Ensure public/exports directory exists
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    const filePath = path.join(exportsDir, uniqueName);
    fs.writeFileSync(filePath, buffer);
    console.log(`Successfully stored export locally at public/exports/${uniqueName} and generated base64 download stream.`);
  } catch (err) {
    console.warn('Local export storage to public/exports failed (likely read-only filesystem). Proceeding with base64 stream anyway.', err);
  }

  if (!localUrl) {
    throw new Error('Failed to save or encode generated export.');
  }

  return { key: uniqueName, signedUrl: localUrl };
}

/**
 * Helper to fetch a signed url if stored in S3, otherwise returns local download path.
 */
export async function getSignedUrl(key: string, expiresIn = 3600): Promise<string> {
  if (s3Client && !key.startsWith('/exports/')) {
    try {
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
      });
      return await getS3SignedUrl(s3Client, command, { expiresIn });
    } catch (err) {
      console.error('Failed to generate pre-signed S3 download URL:', err);
    }
  }
  
  return `/exports/${key}`;
}
