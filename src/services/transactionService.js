import { pool } from '../config/database.js';
import { HttpError } from '../utils/httpError.js';

export async function listTransactions(userId, { month, category, search, page }) {
  const values = [userId];
  const conditions = ['user_id = $1'];
  if (month) {
    values.push(month);
    conditions.push(`to_char(spent_on, 'YYYY-MM') = $${values.length}`);
  }
  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }
  if (search) {
    values.push(`%${search}%`);
    conditions.push(`description ILIKE $${values.length}`);
  }

  const countResult = await pool.query(
    `SELECT count(*)::int AS total, COALESCE(sum(amount), 0)::numeric(12, 2) AS total_amount
     FROM transactions WHERE ${conditions.join(' AND ')}`,
    values,
  );
  const pageSize = 20;
  values.push(pageSize, (page - 1) * pageSize);
  const result = await pool.query(
    `SELECT id, description, amount, category, spent_on, created_at
     FROM transactions WHERE ${conditions.join(' AND ')}
     ORDER BY spent_on DESC, id DESC
     LIMIT $${values.length - 1} OFFSET $${values.length}`,
    values,
  );
  return {
    items: result.rows,
    pagination: { page, pageSize, total: countResult.rows[0].total },
    totalAmount: countResult.rows[0].total_amount,
  };
}

export async function createTransaction(userId, transaction) {
  const result = await pool.query(
    `INSERT INTO transactions (user_id, description, amount, category, spent_on)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, description, amount, category, spent_on, created_at`,
    [userId, transaction.description, transaction.amount, transaction.category, transaction.spentOn],
  );
  return result.rows[0];
}

export async function updateTransaction(userId, id, transaction) {
  const result = await pool.query(
    `UPDATE transactions
     SET description = $1, amount = $2, category = $3, spent_on = $4, updated_at = now()
     WHERE id = $5 AND user_id = $6
     RETURNING id, description, amount, category, spent_on, created_at`,
    [transaction.description, transaction.amount, transaction.category, transaction.spentOn, id, userId],
  );
  if (!result.rows[0]) throw new HttpError(404, 'No se encontró ese gasto en tu cuenta.');
  return result.rows[0];
}

export async function deleteTransaction(userId, id) {
  const result = await pool.query(
    'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
    [id, userId],
  );
  if (!result.rows[0]) throw new HttpError(404, 'No se encontró ese gasto en tu cuenta.');
}
