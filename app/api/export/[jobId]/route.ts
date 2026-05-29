import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis/client';

export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  try {
    const orgId = request.headers.get('x-org-id');
    if (!orgId) {
      return NextResponse.json({ success: false, error: 'Unauthorized.' }, { status: 401 });
    }

    const { jobId } = params;
    const jobKey = `job:${jobId}`;

    const jobData = await redis.get(jobKey);

    if (!jobData) {
      return NextResponse.json({ success: false, error: 'Export job not found or expired.' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      job: JSON.parse(jobData),
    });
  } catch (error) {
    console.error('Check export job status error:', error);
    return NextResponse.json({ success: false, error: 'Internal server error occurred.' }, { status: 500 });
  }
}
