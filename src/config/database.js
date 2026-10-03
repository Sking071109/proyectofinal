import pg from 'pg';
import { getRequiredEnv } from './env.js';

const { Pool } = pg;

export const pool = new Pool({
  connectionString: getRequiredEnv('DATABASE_URL'),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (error) => {
  console.error('Error inesperado en una conexión inactiva de PostgreSQL:', error);
});
