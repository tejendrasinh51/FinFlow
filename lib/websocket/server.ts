import { Client } from 'pg';
import Redis from 'ioredis';
import { WebSocketServer, WebSocket } from 'ws';
import http from 'http';
import url from 'url';
import fs from 'fs';
import path from 'path';
import { verifyJwt } from '../auth/session';

// Self-contained .env loader for standalone Node execution
const envPath = path.join(__dirname, '..', '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const parts = trimmed.split('=');
      const key = parts[0].trim();
      let value = parts.slice(1).join('=').trim();
      
      // Strip wrapping quotes
      if (value.startsWith('"') && value.endsWith('"')) {
        value = value.substring(1, value.length - 1);
      }
      if (value.startsWith("'") && value.endsWith("'")) {
        value = value.substring(1, value.length - 1);
      }
      
      process.env[key] = value;
    }
  });
}

const PORT = parseInt(process.env.WS_PORT || '3001', 10);
const redisUrl = process.env.REDIS_URL;
const dbUrl = process.env.DATABASE_URL;

console.log('Initializing WebSocket Real-Time broker...');

// 1. Establish separate PostgreSQL Listener
let pgClient: Client;
if (dbUrl) {
  pgClient = new Client({
    connectionString: dbUrl,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
  });
  
  pgClient.connect().then(() => {
    console.log('PostgreSQL client successfully connected to notify stream.');
    pgClient.query('LISTEN metric_update');
  }).catch(err => {
    console.error('Failed to connect PG client to notify stream:', err);
  });
} else {
  console.warn('DATABASE_URL missing. Real-time pg_notify triggers will not work.');
}

// 2. Establish separate Redis Publisher and Subscriber
const redisPub = redisUrl ? new Redis(redisUrl) : null;
const redisSub = redisUrl ? new Redis(redisUrl) : null;

if (redisSub) {
  // Subscribe to all org channels
  redisSub.psubscribe('channel:metrics:*').then(() => {
    console.log('Redis subscriber listening on channel:metrics:*');
  }).catch(err => {
    console.error('Failed to psubscribe Redis:', err);
  });
}

// 3. Setup standalone HTTP and WebSocket server
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('FinFlow WebSocket Broker Active\n');
});

const wss = new WebSocketServer({ noServer: true });

// Map of active organization connections (orgId -> Set of WebSockets)
const orgClients: Map<string, Set<WebSocket>> = new Map();

// Authentication and Upgrade handshake
server.on('upgrade', (request, socket, head) => {
  const parsedUrl = url.parse(request.url || '', true);
  const token = parsedUrl.query.token as string;

  if (!token) {
    console.warn('Upgrade failed: Connection lacks JWT token query parameter.');
    socket.write('HTTP/1.1 401 Unauthorized\r\n\r\n');
    socket.destroy();
    return;
  }

  const payload = verifyJwt(token);
  if (!payload) {
    console.warn('Upgrade failed: Invalid or expired JWT token handshake.');
    socket.write('HTTP/1.1 403 Forbidden\r\n\r\n');
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    // Attach tenant context to the socket connection
    (ws as any).orgId = payload.orgId;
    (ws as any).userId = payload.userId;
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws: WebSocket) => {
  const orgId = (ws as any).orgId;
  const userId = (ws as any).userId;
  
  console.log(`[WS Connected] User ${userId} inside Org ${orgId}`);

  if (!orgClients.has(orgId)) {
    orgClients.set(orgId, new Set());
  }
  orgClients.get(orgId)!.add(ws);

  ws.on('close', () => {
    console.log(`[WS Disconnected] User ${userId} from Org ${orgId}`);
    const clients = orgClients.get(orgId);
    if (clients) {
      clients.delete(ws);
      if (clients.size === 0) {
        orgClients.delete(orgId);
      }
    }
  });

  ws.on('error', (err) => {
    console.error(`WebSocket connection error for user ${userId}:`, err);
  });

  // Welcome packet
  ws.send(JSON.stringify({ type: 'connected', timestamp: new Date().toISOString() }));
});

// 4. Connect PostgreSQL Notification and Redis Pub/Sub channels
if (pgClient!) {
  pgClient.on('notification', async (msg) => {
    if (msg.channel === 'metric_update' && msg.payload) {
      try {
        const payload = JSON.parse(msg.payload);
        const orgId = payload.org_id;

        if (process.env.DEBUG_WS === 'true') {
          console.log(`[PG Notify] Update on org ${orgId}: ${msg.payload}`);
        }

        // Publish to Redis Pub/Sub cluster (enables multi-instance scaling)
        if (redisPub) {
          await redisPub.publish(`channel:metrics:${orgId}`, msg.payload);
        } else {
          // If Redis is missing, fall back to direct broadcast
          broadcastToOrg(orgId, payload);
        }
      } catch (err) {
        console.error('Failed to parse pg_notification payload:', err);
      }
    }
  });
}

if (redisSub) {
  redisSub.on('pmessage', (pattern, channel, message) => {
    try {
      const parts = channel.split(':');
      const orgId = parts[parts.length - 1];
      const payload = JSON.parse(message);

      if (process.env.DEBUG_WS === 'true') {
        console.log(`[Redis Sub] Channel ${channel} broadcast.`);
      }

      broadcastToOrg(orgId, payload);
    } catch (err) {
      console.error('Failed to broadcast Redis Pub/Sub update:', err);
    }
  });
}

function broadcastToOrg(orgId: string, payload: any) {
  const clients = orgClients.get(orgId);
  if (!clients || clients.size === 0) return;

  const dataString = JSON.stringify({
    type: 'metric_update',
    metric_type: payload.metric_type || payload.metricType,
    value: parseFloat(payload.value),
    recorded_at: payload.recorded_at || payload.recordedAt,
  });

  for (const client of clients) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(dataString);
    }
  }
}

server.listen(PORT, () => {
  console.log(`WebSocket Server listening on port ${PORT}`);
});
