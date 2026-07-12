import { Router } from 'express';
import {
  listTrips,
  dispatchOptions,
  createTripHandler,
  dispatchTripHandler,
  completeTripHandler,
  cancelTripHandler,
} from '../controllers/tripController.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/', requirePermission('trips', 'view'), listTrips);
router.get('/dispatch-options', requirePermission('trips', 'view'), dispatchOptions);
router.post('/', requirePermission('trips', 'full'), createTripHandler);
router.post('/:id/dispatch', requirePermission('trips', 'full'), dispatchTripHandler);
router.post('/:id/complete', requirePermission('trips', 'full'), completeTripHandler);
router.post('/:id/cancel', requirePermission('trips', 'full'), cancelTripHandler);

export default router;
