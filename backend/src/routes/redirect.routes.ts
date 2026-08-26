import { Router } from 'express';
import { redirectController } from '../controllers/redirect.controller.js';
import { validate } from '../validators/validate.middleware.js';
import { unlockLinkSchema } from '../validators/link.validator.js';

const router = Router();

// API endpoint to inspect link state before navigating (used by redirect handler UI)
router.post('/api/v1/redirect/status/:slug', (req, res) => redirectController.checkRedirectStatus(req, res));

// API endpoint to unlock password-protected link
router.post(
  '/api/v1/redirect/unlock/:slug',
  validate({ body: unlockLinkSchema }),
  (req, res) => redirectController.unlockProtectedLink(req, res)
);

// Fast Root redirect route: /:slug (ex: /my-sale or /aB3k91)
router.get('/:slug', (req, res) => redirectController.handleRedirect(req, res));

export default router;
