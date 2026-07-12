import { Router } from 'express';
import {
  listFuel,
  createFuel,
  listExpenses,
  createExpense,
  operationalCost,
} from '../controllers/fuelController.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/logs', requirePermission('fuel', 'view'), listFuel);
router.post('/logs', requirePermission('fuel', 'full'), createFuel);
router.get('/expenses', requirePermission('fuel', 'view'), listExpenses);
router.post('/expenses', requirePermission('fuel', 'full'), createExpense);
router.get('/operational-cost', requirePermission('fuel', 'view'), operationalCost);

export default router;
