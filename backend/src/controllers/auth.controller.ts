import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AuthController {
  async register(req: Request, res: Response): Promise<any> {
    try {
      const result = await authService.register(req.body);
      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Registration failed', 400);
    }
  }

  async login(req: Request, res: Response): Promise<any> {
    try {
      const result = await authService.login(req.body);
      return sendSuccess(res, result, 'Login successful');
    } catch (error: any) {
      return sendError(res, error.message || 'Login failed', 401);
    }
  }

  async verifyEmail(req: Request, res: Response): Promise<any> {
    try {
      const { token } = req.body;
      const result = await authService.verifyEmail(token);
      return sendSuccess(res, result, 'Email verified successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Verification failed', 400);
    }
  }

  async forgotPassword(req: Request, res: Response): Promise<any> {
    try {
      const { email } = req.body;
      const result = await authService.requestPasswordReset(email);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to request password reset', 400);
    }
  }

  async resetPassword(req: Request, res: Response): Promise<any> {
    try {
      const { token, newPassword } = req.body;
      const result = await authService.resetPassword(token, newPassword);
      return sendSuccess(res, result, result.message);
    } catch (error: any) {
      return sendError(res, error.message || 'Password reset failed', 400);
    }
  }

  async getProfile(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const profile = await authService.getProfile(userId);
      return sendSuccess(res, profile, 'Profile retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch profile', 404);
    }
  }

  async regenerateApiKey(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const result = await authService.regenerateApiKey(userId);
      return sendSuccess(res, result, 'API Key regenerated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to regenerate API Key', 500);
    }
  }
}

export const authController = new AuthController();
