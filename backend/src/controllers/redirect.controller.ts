import { Request, Response } from 'express';
import { redirectService } from '../services/redirect.service.js';
import { config } from '../config/env.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class RedirectController {
  /**
   * Fast root redirect handler: /:slug
   */
  async handleRedirect(req: Request, res: Response): Promise<any> {
    try {
      const slug = req.params.slug as string;
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress;
      const referrer = req.headers['referer'] || req.headers['referrer'];
      const userAgent = req.headers['user-agent'];

      const result = await redirectService.resolveRedirect({
        slug,
        ip,
        referrer: typeof referrer === 'string' ? referrer : undefined,
        userAgent,
      });

      if (result.status === 'REDIRECT' && result.targetUrl) {
        // Direct fast HTTP 301/302 Redirect
        const statusCode = result.redirectType === 301 ? 301 : 302;
        return res.redirect(statusCode, result.targetUrl);
      }

      // If special state (Password Protected, Expired, Disabled, Not Found), send to frontend redirect handler
      const frontendRedirectUrl = `${config.frontendUrl}/redirect/${result.status.toLowerCase()}?slug=${encodeURIComponent(slug)}`;
      return res.redirect(302, frontendRedirectUrl);
    } catch (error: any) {
      const fallbackSlug = (req.params.slug as string) || '';
      return res.redirect(302, `${config.frontendUrl}/redirect/not_found?slug=${encodeURIComponent(fallbackSlug)}`);
    }
  }

  /**
   * API endpoint to get redirect status & verify password
   */
  async checkRedirectStatus(req: Request, res: Response): Promise<any> {
    try {
      const slug = req.params.slug as string;
      const { password } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress;
      const referrer = req.headers['referer'] || req.headers['referrer'];
      const userAgent = req.headers['user-agent'];

      const result = await redirectService.resolveRedirect({
        slug,
        ip,
        referrer: typeof referrer === 'string' ? referrer : undefined,
        userAgent,
        password,
      });

      return sendSuccess(res, result, `Status: ${result.status}`);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to check status', 400);
    }
  }

  /**
   * API endpoint to unlock password-protected link
   */
  async unlockProtectedLink(req: Request, res: Response): Promise<any> {
    try {
      const slug = req.params.slug as string;
      const { password } = req.body;
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.socket.remoteAddress;
      const referrer = req.headers['referer'] || req.headers['referrer'];
      const userAgent = req.headers['user-agent'];

      const result = await redirectService.resolveRedirect({
        slug,
        ip,
        referrer: typeof referrer === 'string' ? referrer : undefined,
        userAgent,
        password,
      });

      if (result.status === 'REDIRECT' && result.targetUrl) {
        return sendSuccess(res, { targetUrl: result.targetUrl, redirectType: result.redirectType }, 'Password verified successfully');
      }

      return sendError(res, result.reason || 'Invalid password', 400);
    } catch (error: any) {
      return sendError(res, error.message || 'Password verification failed', 400);
    }
  }
}

export const redirectController = new RedirectController();
