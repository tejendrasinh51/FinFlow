import { Pool, QueryResult, QueryResultRow } from 'pg';

const connectionString = process.env.DATABASE_URL;
const replicaConnectionString = process.env.DATABASE_URL_REPLICA;

if (!connectionString) {
  console.warn('DATABASE_URL is not set. Database queries will fail.');
}

// Enable secure SSL connection on AWS RDS or Vercel postgres
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { rejectUnauthorized: false } 
  : undefined;

// Create Primary Pool
export const pool = new Pool({
  connectionString,
  ssl: sslConfig,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Create Replica Pool (for read-only operations if available, fall back to primary)
export const replicaPool = replicaConnectionString 
  ? new Pool({
      connectionString: replicaConnectionString,
      ssl: sslConfig,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    })
  : pool;

// Query helper with automatic error logging and connection safety
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[],
  useReplica = false
): Promise<QueryResult<T>> {
  const selectedPool = useReplica ? replicaPool : pool;
  const start = Date.now();
  try {
    const res = await selectedPool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.DEBUG_DB === 'true') {
      console.log('Executed query', { text, duration, rows: res.rowCount });
    }
    return res;
  } catch (error) {
    console.error('Database query error:', { text, error });
    throw error;
  }
}

// Transaction transaction helper
export async function transaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction rollback due to error:', error);
    throw error;
  } finally {
    client.release();
  }
}
