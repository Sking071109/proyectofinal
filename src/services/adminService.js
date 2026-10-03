import { pool } from '../config/database.js';

export async function getSummary() {
  const result = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM app_users) AS user_count,
       (SELECT count(*)::int FROM transactions) AS transaction_count,
       (SELECT COALESCE(sum(amount), 0)::numeric(12, 2) FROM transactions) AS recorded_amount`,
  );
  return result.rows[0];
}
