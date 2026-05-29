import { redis } from './client';

/**
 * Publishes an event to a Redis Pub/Sub channel
 */
export async function publishEvent(channel: string, payload: any): Promise<void> {
  try {
    const message = typeof payload === 'string' ? payload : JSON.stringify(payload);
    await redis.publish(channel, message);
    if (process.env.DEBUG_REDIS === 'true') {
      console.log(`[Redis Pub] Channel: ${channel}`);
    }
  } catch (error) {
    console.error(`Failed to publish Redis event on channel ${channel}:`, error);
  }
}
