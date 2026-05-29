import jwt from 'jsonwebtoken';
import { redis } from '../redis/client';

const privateKey = process.env.JWT_PRIVATE_KEY;
const publicKey = process.env.JWT_PUBLIC_KEY;
const fallbackSecret = process.env.SESSION_SECRET || 'finflow-development-secret-key-123456';

export interface SessionPayload {
  userId: string;
  orgId: string;
  role: 'admin' | 'analyst' | 'viewer';
  name: string;
}

/**
 * Signs a session payload into a JWT. Uses RS256 if RSA keys are provided,
 * otherwise falls back to HS256.
 */
export function signJwt(payload: SessionPayload): string {
  try {
    if (privateKey) {
      // RS256 asymmetric signing
      // Replace literal \n in env values with actual newlines
      const formattedKey = privateKey.replace(/\\n/g, '\n');
      return jwt.sign(payload, formattedKey, { algorithm: 'RS256', expiresIn: '15m' });
    }
  } catch (error) {
    console.error('RS256 signing failed, falling back to HS256:', error);
  }

  // HS256 symmetric fallback
  return jwt.sign(payload, fallbackSecret, { algorithm: 'HS256', expiresIn: '15m' });
}

/**
 * Verifies a JWT token. Handles both RS256 and HS256 automatically.
 */
export function verifyJwt(token: string): SessionPayload | null {
  try {
    if (publicKey) {
      const formattedKey = publicKey.replace(/\\n/g, '\n');
      return jwt.verify(token, formattedKey, { algorithms: ['RS256'] }) as SessionPayload;
    }
  } catch (error) {
    // If public key verification fails, check fallback
  }

  try {
    return jwt.verify(token, fallbackSecret, { algorithms: ['HS256'] }) as SessionPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Stores a session in Redis (mapping session details to allow server-side revoking)
 * TTL of session is set to 7 days.
 */
export async function createSession(
  userId: string,
  orgId: string,
  role: 'admin' | 'analyst' | 'viewer',
  name: string
): Promise<string> {
  const payload: SessionPayload = { userId, orgId, role, name };
  const token = signJwt(payload);
  
  // Keep refresh state in Redis mapped under session
  const sessionKey = `session:${userId}:${token.substring(token.length - 20)}`;
  const sessionData = JSON.stringify({ userId, orgId, role, name, active: true });
  
  // Set Redis session with a 7-day TTL (604800 seconds)
  await redis.set(sessionKey, sessionData, 'EX', 604800);

  return token;
}

/**
 * Verifies if a session is still active and valid in Redis
 */
export async function isSessionActive(userId: string, token: string): Promise<boolean> {
  const sessionKey = `session:${userId}:${token.substring(token.length - 20)}`;
  const sessionData = await redis.get(sessionKey);
  if (!sessionData) return false;
  
  const session = JSON.parse(sessionData);
  return session.active === true;
}

/**
 * Revokes a session by deleting it from Redis
 */
export async function revokeSession(userId: string, token: string): Promise<void> {
  const sessionKey = `session:${userId}:${token.substring(token.length - 20)}`;
  await redis.del(sessionKey);
}
