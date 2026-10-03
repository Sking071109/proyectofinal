import jwt from 'jsonwebtoken';
import { getRequiredEnv } from '../config/env.js';

export function authenticate(req, res, next) {
  const authorization = req.get('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Debes iniciar sesión para continuar.' });
  }

  try {
    const token = authorization.slice(7);
    const payload = jwt.verify(token, getRequiredEnv('JWT_SECRET'), {
      algorithms: ['HS256'],
      issuer: 'bolsillo-claro-api',
    });
    if (typeof payload.sub !== 'string' || !['user', 'admin'].includes(payload.role)) {
      return res.status(401).json({ error: 'La sesión no es válida.' });
    }
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return res.status(401).json({ error: 'La sesión venció o no es válida. Inicia sesión otra vez.' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Esta acción requiere permisos de administrador.' });
  }
  return next();
}
