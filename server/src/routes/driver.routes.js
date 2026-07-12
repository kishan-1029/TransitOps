import { Router } from 'express';
import {
  listDrivers,
  createDriver,
  updateDriver,
  deleteDriver,
} from '../controllers/driverController.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', requirePermission('drivers', 'view'), listDrivers);
router.post('/', requirePermission('drivers', 'full'), createDriver);
router.patch('/:id', requirePermission('drivers', 'full'), updateDriver);
router.delete('/:id', requirePermission('drivers', 'full'), deleteDriver);

export default router;
