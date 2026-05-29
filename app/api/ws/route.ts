import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // Read target WS address from environment, fall back to default localhost 3001
  const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001';
  
  return NextResponse.json({
    success: true,
    url: wsUrl,
    description: 'Establish WebSocket connections by upgrading request to the provided target URL.'
  });
}
