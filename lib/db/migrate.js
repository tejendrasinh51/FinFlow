const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

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

if (!process.env.DATABASE_URL) {
  console.error('Error: DATABASE_URL environment variable is not defined.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : undefined,
});

async function runMigrations() {
  const client = await pool.connect();
  try {
    console.log('Starting database migrations...');
    const files = [
      '001_initial_schema.sql',
      '002_indexes_and_rls.sql',
      '003_notify_triggers.sql',
    ];

    for (const file of files) {
      const filePath = path.join(__dirname, 'migrations', file);
      console.log(`Executing: ${file}`);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Migration file not found at: ${filePath}`);
      }

      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`Successfully completed: ${file}`);
    }
    
    console.log('All migrations completed successfully.');
  } catch (error) {
    console.error('Migration failed with error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations();
