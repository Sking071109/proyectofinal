import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateCategory,
  validateCredentials,
  validateId,
  validateMonth,
  validateTransaction,
} from '../src/utils/validation.js';
import { HttpError } from '../src/utils/httpError.js';

test('normaliza el correo y valida credenciales', () => {
  assert.deepEqual(
    validateCredentials({ email: '  Persona@Example.com ', password: 'ClaveSegura123' }),
    { email: 'persona@example.com', password: 'ClaveSegura123' },
  );
});

test('rechaza credenciales inválidas', () => {
  assert.throws(() => validateCredentials({ email: 'no-es-correo', password: '123' }), HttpError);
  assert.throws(() => validateCredentials({
    email: 'persona@example.com',
    password: 'ñ'.repeat(40),
  }), HttpError);
});

test('valida y normaliza un gasto', () => {
  assert.deepEqual(
    validateTransaction({
      description: '  Café  ',
      amount: '1250.5',
      category: 'Comida',
      spent_on: '2026-10-03',
    }),
    { description: 'Café', amount: 1250.5, category: 'Comida', spentOn: '2026-10-03' },
  );
});

test('rechaza monto negativo, fecha imposible y categoría usada para inyección', () => {
  assert.throws(() => validateTransaction({
    description: 'Gasto',
    amount: -1,
    category: 'Comida',
    spent_on: '2026-10-03',
  }), HttpError);
  assert.throws(() => validateTransaction({
    description: 'Gasto',
    amount: 1,
    category: 'Comida',
    spent_on: '2026-02-30',
  }), HttpError);
  assert.throws(() => validateCategory("Comida' OR 1=1 --"), HttpError);
});

test('valida ids positivos y filtros de mes', () => {
  assert.equal(validateId('12'), 12);
  assert.equal(validateMonth('2026-10'), '2026-10');
  assert.throws(() => validateId('1 OR 1=1'), HttpError);
  assert.throws(() => validateMonth('2026-13'), HttpError);
});
