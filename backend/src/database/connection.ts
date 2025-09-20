import { Pool, PoolConfig } from 'pg';
import { createClient } from 'redis';

const dbConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(dbConfig);

export const redis = createClient({
  url: process.env.REDIS_URL,
});

redis.on('error', (err) => {
  console.error('Redis Client Error', err);
});

redis.on('connect', () => {
  console.log('Connected to Redis');
});

export const connectDatabases = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Connected to PostgreSQL');
    client.release();

    await redis.connect();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const disconnectDatabases = async (): Promise<void> => {
  await pool.end();
  await redis.quit();
  console.log('Disconnected from databases');
};