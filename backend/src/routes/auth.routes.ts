import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { validate } from '../validators/validate.middleware.js';
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../validators/auth.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';
import { authLimiter } from '../middlewares/rate-limiter.middleware.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: registerSchema }), (req, res) => authController.register(req, res));
router.post('/login', authLimiter, validate({ body: loginSchema }), (req, res) => authController.login(req, res));
router.post('/verify-email', validate({ body: verifyEmailSchema }), (req, res) => authController.verifyEmail(req, res));
router.post('/forgot-password', authLimiter, validate({ body: forgotPasswordSchema }), (req, res) => authController.forgotPassword(req, res));
router.post('/reset-password', authLimiter, validate({ body: resetPasswordSchema }), (req, res) => authController.resetPassword(req, res));
router.get('/me', requireAuth, (req, res) => authController.getProfile(req, res));
router.post('/regenerate-api-key', requireAuth, (req, res) => authController.regenerateApiKey(req, res));

export default router;
