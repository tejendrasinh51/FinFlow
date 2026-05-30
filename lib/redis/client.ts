import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL;

class RedisMock {
  private store: Map<string, string> = new Map();

  async get(key: string): Promise<string | null> {
    return this.store.get(key) || null;
  }

  async set(key: string, value: string, mode?: string, duration?: number): Promise<'OK'> {
    this.store.set(key, value);
    if (mode === 'EX' && duration) {
      setTimeout(() => this.store.delete(key), duration * 1000);
    }
    return 'OK';
  }

  async del(key: string): Promise<number> {
    const existed = this.store.has(key);
    this.store.delete(key);
    return existed ? 1 : 0;
  }

  async keys(pattern: string): Promise<string[]> {
    const rawPattern = pattern.replace('*', '');
    return Array.from(this.store.keys()).filter(k => k.includes(rawPattern));
  }

  // Pub/Sub simulation
  async publish(channel: string, message: string): Promise<number> {
    if (process.env.DEBUG_REDIS === 'true') {
      console.log(`[Mock Pub] Channel ${channel}: ${message}`);
    }
    return 1;
  }
}

let redisInstance: any;

if (redisUrl) {
  try {
    const redisOptions: any = {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        const delay = Math.min(times * 100, 3000);
        return delay;
      },
    };

    if (redisUrl.startsWith('rediss://')) {
      try {
        const parsedUrl = new URL(redisUrl);
        redisOptions.tls = {
          servername: parsedUrl.hostname,
        };
      } catch (e) {
        console.error('Failed to parse REDIS_URL for TLS servername:', e);
      }
    }

    redisInstance = new Redis(redisUrl, redisOptions);

    redisInstance.on('error', (err: any) => {
      console.error('Redis error encountered:', err);
    });

    redisInstance.on('connect', () => {
      console.log('Redis client successfully connected.');
    });
  } catch (err) {
    console.error('Failed to initialize connection to Redis. Falling back to Mock store.', err);
    redisInstance = new RedisMock();
  }
} else {
  console.warn('REDIS_URL is not set. Falling back to in-memory Mock store.');
  redisInstance = new RedisMock();
}

export const redis = redisInstance;
