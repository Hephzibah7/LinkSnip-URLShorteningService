import { Request, Response } from 'express';
import { tagFolderService } from '../services/tag-folder.service.js';
import { sendSuccess, sendError } from '../utils/response.js';

export class TagFolderController {
  // Tags
  async getTags(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const tags = await tagFolderService.getUserTags(userId);
      return sendSuccess(res, tags, 'Tags retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve tags', 500);
    }
  }

  async createTag(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const { name, color } = req.body;
      const tag = await tagFolderService.createTag(userId, name, color);
      return sendSuccess(res, tag, 'Tag created', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create tag', 400);
    }
  }

  async updateTag(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { name, color } = req.body;
      const updated = await tagFolderService.updateTag(id, userId, name, color);
      return sendSuccess(res, updated, 'Tag updated');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update tag', 400);
    }
  }

  async deleteTag(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      await tagFolderService.deleteTag(id, userId);
      return sendSuccess(res, { id }, 'Tag deleted');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete tag', 400);
    }
  }

  // Folders
  async getFolders(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const folders = await tagFolderService.getUserFolders(userId);
      return sendSuccess(res, folders, 'Folders retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve folders', 500);
    }
  }

  async createFolder(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const { name, description, color } = req.body;
      const folder = await tagFolderService.createFolder(userId, name, description, color);
      return sendSuccess(res, folder, 'Folder created', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create folder', 400);
    }
  }

  async updateFolder(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      const { name, description, color } = req.body;
      const updated = await tagFolderService.updateFolder(id, userId, name, description, color);
      return sendSuccess(res, updated, 'Folder updated');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update folder', 400);
    }
  }

  async deleteFolder(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user!.id;
      const id = req.params.id as string;
      await tagFolderService.deleteFolder(id, userId);
      return sendSuccess(res, { id }, 'Folder deleted');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete folder', 400);
    }
  }
}

export const tagFolderController = new TagFolderController();
