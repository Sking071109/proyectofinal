import { Router } from 'express';
import * as transactionController from '../controllers/transactionController.js';
import { authenticate } from '../middlewares/authMiddleware.js';

const router = Router();

router.use(authenticate);
router.get('/', transactionController.list);
router.post('/', transactionController.create);
router.put('/:id', transactionController.update);
router.delete('/:id', transactionController.remove);

export default router;
