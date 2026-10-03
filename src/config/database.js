import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import pg from 'pg';
import { getRequiredEnv } from './env.js';

const { Pool } = pg;

const connectionString = getRequiredEnv('DATABASE_URL');
const sslCaPath = process.env.DATABASE_SSL_CA;
const poolConfig = {
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
};

if (sslCaPath) {
  const url = new URL(connectionString);
  url.searchParams.delete('sslmode');
  url.searchParams.delete('sslrootcert');
  poolConfig.connectionString = url.toString();
  poolConfig.ssl = {
    ca: readFileSync(resolve(process.cwd(), sslCaPath), 'utf8'),
    rejectUnauthorized: true,
  };
}

export const pool = new Pool(poolConfig);

pool.on('error', (error) => {
  console.error('Error inesperado en una conexión inactiva de PostgreSQL:', error);
});
