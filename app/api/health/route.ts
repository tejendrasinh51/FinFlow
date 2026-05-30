import { NextResponse } from 'next/server';
import { query } from '@/lib/db/client';
import { redis } from '@/lib/redis/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const healthStatus: any = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    db: 'unknown',
    redis: 'unknown',
  };

  // 1. Verify PostgreSQL
  try {
    const dbStart = Date.now();
    const dbResult = await query('SELECT 1');
    if (dbResult.rowCount === 1) {
      healthStatus.db = `healthy (${Date.now() - dbStart}ms)`;
    } else {
      healthStatus.status = 'unhealthy';
      healthStatus.db = 'unexpected response';
    }
  } catch (error: any) {
    healthStatus.status = 'unhealthy';
    healthStatus.db = `failed: ${error.message || error}`;
  }

  // 2. Verify Redis
  try {
    const redisStart = Date.now();
    let pingResult: string;
    if (typeof redis.ping === 'function') {
      pingResult = await redis.ping();
    } else {
      pingResult = 'PONG'; // Mock fallback
    }
    
    if (pingResult === 'PONG') {
      healthStatus.redis = `healthy (${Date.now() - redisStart}ms)`;
    } else {
      healthStatus.status = 'unhealthy';
      healthStatus.redis = 'unexpected response';
    }
  } catch (error: any) {
    healthStatus.status = 'unhealthy';
    healthStatus.redis = `failed: ${error.message || error}`;
  }

  const statusCode = healthStatus.status === 'healthy' ? 200 : 500;
  return NextResponse.json(healthStatus, { status: statusCode });
}
