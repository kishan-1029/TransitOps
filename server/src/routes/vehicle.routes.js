import { Router } from 'express';
import {
  listVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
} from '../controllers/vehicleController.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', requirePermission('fleet', 'view'), listVehicles);
router.get('/:id', requirePermission('fleet', 'view'), getVehicle);
router.post('/', requirePermission('fleet', 'full'), createVehicle);
router.patch('/:id', requirePermission('fleet', 'full'), updateVehicle);
router.delete('/:id', requirePermission('fleet', 'full'), deleteVehicle);

export default router;
