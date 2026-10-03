import * as transactionService from '../services/transactionService.js';
import {
  validateCategory,
  validateId,
  validateMonth,
  validateTransaction,
} from '../utils/validation.js';
import { HttpError } from '../utils/httpError.js';

function getPage(value) {
  if (value === undefined) return 1;
  const page = Number(value);
  if (!Number.isSafeInteger(page) || page < 1 || page > 10000) {
    throw new HttpError(400, 'La página solicitada no es válida.');
  }
  return page;
}

function getSearch(value) {
  if (value === undefined) return undefined;
  if (typeof value !== 'string' || value.length > 80) {
    throw new HttpError(400, 'La búsqueda debe tener hasta 80 caracteres.');
  }
  return value.trim() || undefined;
}

export async function list(req, res) {
  const filters = {
    month: validateMonth(req.query.month),
    category: validateCategory(req.query.category),
    search: getSearch(req.query.search),
    page: getPage(req.query.page),
  };
  const result = await transactionService.listTransactions(req.user.id, filters);
  return res.status(200).json(result);
}

export async function create(req, res) {
  const transaction = validateTransaction(req.body);
  const result = await transactionService.createTransaction(req.user.id, transaction);
  return res.status(201).json({ item: result });
}

export async function update(req, res) {
  const id = validateId(req.params.id);
  const transaction = validateTransaction(req.body);
  const result = await transactionService.updateTransaction(req.user.id, id, transaction);
  return res.status(200).json({ item: result });
}

export async function remove(req, res) {
  const id = validateId(req.params.id);
  await transactionService.deleteTransaction(req.user.id, id);
  return res.status(200).json({ message: 'Gasto eliminado.' });
}
