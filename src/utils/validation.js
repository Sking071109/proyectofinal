import { HttpError } from './httpError.js';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIES = ['Comida', 'Transporte', 'Hogar', 'Salud', 'Ocio', 'Otros'];

export function validateCredentials(body) {
  const { email, password } = body ?? {};
  if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim()) || email.length > 254) {
    throw new HttpError(400, 'Ingresa un correo electrónico válido.');
  }
  if (typeof password !== 'string' || password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
    throw new HttpError(400, 'La contraseña debe tener al menos 8 caracteres y no superar 72 bytes.');
  }
  return { email: email.trim().toLowerCase(), password };
}

export function validateTransaction(body) {
  const { description, amount, category, spent_on: spentOn } = body ?? {};
  const parsedAmount = Number(amount);
  if (typeof description !== 'string' || !description.trim() || description.trim().length > 120) {
    throw new HttpError(400, 'La descripción es obligatoria y debe tener hasta 120 caracteres.');
  }
  if (!Number.isFinite(parsedAmount) || parsedAmount <= 0 || parsedAmount > 1000000000) {
    throw new HttpError(400, 'El monto debe ser un número mayor que cero.');
  }
  if (typeof category !== 'string' || !CATEGORIES.includes(category)) {
    throw new HttpError(400, 'Selecciona una categoría válida.');
  }
  if (typeof spentOn !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(spentOn)) {
    throw new HttpError(400, 'La fecha debe tener el formato AAAA-MM-DD.');
  }
  const date = new Date(`${spentOn}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== spentOn) {
    throw new HttpError(400, 'La fecha no es válida.');
  }
  return {
    description: description.trim(),
    amount: Math.round(parsedAmount * 100) / 100,
    category,
    spentOn,
  };
}

export function validateId(value) {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id < 1) {
    throw new HttpError(400, 'El identificador no es válido.');
  }
  return id;
}

export function validateMonth(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(value)) {
    throw new HttpError(400, 'El mes debe tener el formato AAAA-MM.');
  }
  return value;
}

export function validateCategory(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || !CATEGORIES.includes(value)) {
    throw new HttpError(400, 'La categoría no es válida.');
  }
  return value;
}
