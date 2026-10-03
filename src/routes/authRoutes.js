import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import * as authController from '../controllers/authController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Demasiados intentos. Espera unos minutos antes de volver a probar.' },
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authenticate, authController.me);

export default router;
