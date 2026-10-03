import { Router } from 'express';
import * as adminController from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/summary', authenticate, requireAdmin, adminController.summary);

export default router;
