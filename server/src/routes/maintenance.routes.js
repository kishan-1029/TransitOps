import { Router } from 'express';
import {
  listMaintenance,
  createMaintenanceHandler,
  closeMaintenanceHandler,
} from '../controllers/maintenanceController.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', requirePermission('maintenance', 'view'), listMaintenance);
router.post('/', requirePermission('maintenance', 'full'), createMaintenanceHandler);
router.post('/:id/close', requirePermission('maintenance', 'full'), closeMaintenanceHandler);

export default router;
