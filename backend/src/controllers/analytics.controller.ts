import { Request, Response } from 'express';
import { analyticsService } from '../services/analytics.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class AnalyticsController {
  async getLinkAnalytics(req: Request, res: Response): Promise<any> {
    try {
      const linkId = req.params.linkId as string;
      const userId = req.user?.id;
      const { startDate, endDate } = req.query as any;

      const result = await analyticsService.getLinkAnalytics(linkId, userId, {
        startDate,
        endDate,
      });

      return sendSuccess(res, result, 'Analytics retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch analytics', 400);
    }
  }

  async getUserOverview(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const { startDate, endDate } = req.query as any;

      const result = await analyticsService.getUserOverviewAnalytics(userId, {
        startDate,
        endDate,
      });

      return sendSuccess(res, result, 'Overview analytics retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch user analytics', 500);
    }
  }

  async exportCsv(req: Request, res: Response): Promise<any> {
    try {
      const linkId = req.params.linkId as string;
      const userId = req.user?.id;

      const csvContent = await analyticsService.exportLinkAnalyticsCsv(linkId, userId);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="linksnip_analytics_${linkId}.csv"`);
      return res.status(200).send(csvContent);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to export analytics CSV', 400);
    }
  }

  async getClickLogs(req: Request, res: Response): Promise<any> {
    try {
      const linkId = req.params.linkId as string;
      const userId = req.user?.id;
      const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

      const result = await analyticsService.getClickEventLogs(linkId, userId, page, limit);

      return sendSuccess(res, result.events, 'Click logs retrieved', 200, {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to fetch click logs', 400);
    }
  }
}

export const analyticsController = new AnalyticsController();
