import { Request, Response } from 'express';
import { linkService } from '../services/link.service.js';
import { qrService } from '../services/qr.service.js';
import { csvService } from '../services/csv.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class LinkController {
  async createLink(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.id;
      const link = await linkService.createLink({
        ...req.body,
        userId,
      });
      return sendSuccess(res, link, 'Short link created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create short link', 400);
    }
  }

  async getUserLinks(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const { search, folderId, tagId, status, sortBy, sortOrder, page, limit } = req.query as any;

      const result = await linkService.getUserLinks({
        userId,
        search,
        folderId,
        tagId,
        status,
        sortBy,
        sortOrder,
        page,
        limit,
      });

      return sendSuccess(res, result.links, 'Links fetched successfully', 200, {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve links', 500);
    }
  }

  async getLinkDetails(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id as string;
      const userId = req.user?.id;
      const link = await linkService.getLinkDetails(id, userId);
      return sendSuccess(res, link, 'Link details retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Link not found', 404);
    }
  }

  async updateLink(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      const updated = await linkService.updateLink(id, userId, req.body);
      return sendSuccess(res, updated, 'Link updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update link', 400);
    }
  }

  async deleteLink(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id as string;
      const userId = req.user!.id;
      await linkService.deleteLink(id, userId);
      return sendSuccess(res, { id }, 'Link deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete link', 400);
    }
  }

  async bulkDelete(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const { ids } = req.body;
      const deletedCount = await linkService.bulkDelete(ids, userId);
      return sendSuccess(res, { count: deletedCount }, `Successfully deleted ${deletedCount} links`);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to bulk delete links', 400);
    }
  }

  async bulkCreateFromCsv(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      let csvContent: Buffer | string | undefined;

      if (req.file) {
        csvContent = req.file.buffer;
      } else if (req.body.csvText) {
        csvContent = req.body.csvText;
      } else {
        return sendError(res, 'Please upload a CSV file or provide csvText in request body', 400);
      }

      const result = await linkService.bulkCreateFromCsv(userId, csvContent!);
      return sendSuccess(res, result, `Processed ${result.totalProcessed} links. ${result.successful} created, ${result.failed} failed.`);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to process CSV file', 400);
    }
  }

  async getBulkTemplate(req: Request, res: Response): Promise<any> {
    try {
      const csv = csvService.getBulkTemplateCsv();
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="linksnip_bulk_template.csv"');
      return res.status(200).send(csv);
    } catch (error: any) {
      return sendError(res, 'Failed to generate CSV template', 500);
    }
  }

  async getLinkQr(req: Request, res: Response): Promise<any> {
    try {
      const id = req.params.id as string;
      const format = (req.query.format as string) || 'png';
      const link = await linkService.getLinkDetails(id, req.user?.id);

      if (format === 'svg') {
        const svg = await qrService.generateSvg(link.shortUrl);
        res.setHeader('Content-Type', 'image/svg+xml');
        return res.status(200).send(svg);
      }

      const dataUrl = await qrService.generateDataUrl(link.shortUrl);
      const base64Data = dataUrl.replace(/^data:image\/png;base64,/, '');
      const imgBuffer = Buffer.from(base64Data, 'base64');
      res.setHeader('Content-Type', 'image/png');
      return res.status(200).send(imgBuffer);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to generate QR code', 400);
    }
  }
}

export const linkController = new LinkController();
