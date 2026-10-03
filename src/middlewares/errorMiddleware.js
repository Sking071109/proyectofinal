import { HttpError } from '../utils/httpError.js';

export function notFound(req, res) {
  return res.status(404).json({ error: 'La ruta solicitada no existe.' });
}

export function handleError(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error instanceof HttpError) {
    return res.status(error.status).json({ error: error.message });
  }
  if (error.type === 'entity.too.large') {
    return res.status(413).json({ error: 'La solicitud es demasiado grande.' });
  }
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo JSON de la solicitud no es válido.' });
  }
  console.error('Error no controlado en la API:', error);
  return res.status(500).json({ error: 'Ocurrió un error interno. Intenta nuevamente.' });
}
