import { Router } from 'express';
import { analyticsController } from '../controllers/analytics.controller.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// User-level aggregate overview
router.get('/overview', requireAuth, (req, res) => analyticsController.getUserOverview(req, res));

// Single link analytics
router.get('/:linkId', optionalAuth, (req, res) => analyticsController.getLinkAnalytics(req, res));
router.get('/:linkId/export', optionalAuth, (req, res) => analyticsController.exportCsv(req, res));
router.get('/:linkId/logs', optionalAuth, (req, res) => analyticsController.getClickLogs(req, res));

export default router;
