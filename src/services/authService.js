import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database.js';
import { getRequiredEnv } from '../config/env.js';
import { HttpError } from '../utils/httpError.js';

function createToken(user) {
  return jwt.sign(
    { role: user.role },
    getRequiredEnv('JWT_SECRET'),
    { subject: String(user.id), expiresIn: '2h', issuer: 'bolsillo-claro-api', algorithm: 'HS256' },
  );
}

export async function register({ email, password }) {
  const passwordHash = await bcrypt.hash(password, 12);
  try {
    const result = await pool.query(
      `INSERT INTO app_users (email, password_hash)
       VALUES ($1, $2)
       RETURNING id, email, role, created_at`,
      [email, passwordHash],
    );
    const user = result.rows[0];
    return { user, token: createToken(user) };
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Ya existe una cuenta con ese correo.');
    }
    throw error;
  }
}

export async function login({ email, password }) {
  const result = await pool.query(
    'SELECT id, email, role, password_hash, created_at FROM app_users WHERE email = $1',
    [email],
  );
  const user = result.rows[0];
  const passwordMatches = user ? await bcrypt.compare(password, user.password_hash) : false;
  if (!passwordMatches) {
    throw new HttpError(401, 'Correo o contraseña incorrectos.');
  }
  const { password_hash: passwordHash, ...safeUser } = user;
  return { user: safeUser, token: createToken(user) };
}

export async function getUserById(id) {
  const result = await pool.query(
    'SELECT id, email, role, created_at FROM app_users WHERE id = $1',
    [id],
  );
  if (!result.rows[0]) throw new HttpError(404, 'La cuenta ya no existe.');
  return result.rows[0];
}
