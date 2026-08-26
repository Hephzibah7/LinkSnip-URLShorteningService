import { Router } from 'express';
import multer from 'multer';
import { linkController } from '../controllers/link.controller.js';
import { validate } from '../validators/validate.middleware.js';
import {
  createLinkSchema,
  updateLinkSchema,
  bulkDeleteSchema,
  queryLinkSchema,
} from '../validators/link.validator.js';
import { requireAuth, optionalAuth } from '../middlewares/auth.middleware.js';
import { createLinkLimiter } from '../middlewares/rate-limiter.middleware.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max CSV file size
});

// Create link (both guest and authenticated supported)
router.post(
  '/',
  createLinkLimiter,
  optionalAuth,
  validate({ body: createLinkSchema }),
  (req, res) => linkController.createLink(req, res)
);

// User links management
router.get(
  '/',
  requireAuth,
  validate({ query: queryLinkSchema }),
  (req, res) => linkController.getUserLinks(req, res)
);

// Bulk CSV template & upload
router.get('/bulk/template', (req, res) => linkController.getBulkTemplate(req, res));
router.post(
  '/bulk',
  requireAuth,
  upload.single('file'),
  (req, res) => linkController.bulkCreateFromCsv(req, res)
);

// Bulk delete
router.post(
  '/bulk-delete',
  requireAuth,
  validate({ body: bulkDeleteSchema }),
  (req, res) => linkController.bulkDelete(req, res)
);

// Single link operations
router.get('/:id', optionalAuth, (req, res) => linkController.getLinkDetails(req, res));
router.get('/:id/qr', optionalAuth, (req, res) => linkController.getLinkQr(req, res));
router.patch(
  '/:id',
  requireAuth,
  validate({ body: updateLinkSchema }),
  (req, res) => linkController.updateLink(req, res)
);
router.delete('/:id', requireAuth, (req, res) => linkController.deleteLink(req, res));

export default router;
