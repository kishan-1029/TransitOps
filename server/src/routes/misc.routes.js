import { Router } from 'express';
import {
  dashboardKpis,
  analyticsSummary,
  exportCsv,
  getSettings,
  updateSettings,
} from '../controllers/dashboardController.js';
import { globalSearch } from '../controllers/searchController.js';
import { authMiddleware, requirePermission } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);
router.get('/search', globalSearch);
router.get('/dashboard/kpis', requirePermission('dashboard', 'view'), dashboardKpis);
router.get('/analytics/summary', requirePermission('analytics', 'view'), analyticsSummary);
router.get('/analytics/export.csv', requirePermission('analytics', 'view'), exportCsv);
router.get('/settings', requirePermission('settings', 'view'), getSettings);
router.patch('/settings', requirePermission('settings', 'full'), updateSettings);

export default router;
