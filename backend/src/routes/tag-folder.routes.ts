import { Router } from 'express';
import { tagFolderController } from '../controllers/tag-folder.controller.js';
import { validate } from '../validators/validate.middleware.js';
import {
  createTagSchema,
  updateTagSchema,
  createFolderSchema,
  updateFolderSchema,
} from '../validators/tag-folder.validator.js';
import { requireAuth } from '../middlewares/auth.middleware.js';

const router = Router();

// Tags
router.get('/tags', requireAuth, (req, res) => tagFolderController.getTags(req, res));
router.post('/tags', requireAuth, validate({ body: createTagSchema }), (req, res) => tagFolderController.createTag(req, res));
router.patch('/tags/:id', requireAuth, validate({ body: updateTagSchema }), (req, res) => tagFolderController.updateTag(req, res));
router.delete('/tags/:id', requireAuth, (req, res) => tagFolderController.deleteTag(req, res));

// Folders
router.get('/folders', requireAuth, (req, res) => tagFolderController.getFolders(req, res));
router.post('/folders', requireAuth, validate({ body: createFolderSchema }), (req, res) => tagFolderController.createFolder(req, res));
router.patch('/folders/:id', requireAuth, validate({ body: updateFolderSchema }), (req, res) => tagFolderController.updateFolder(req, res));
router.delete('/folders/:id', requireAuth, (req, res) => tagFolderController.deleteFolder(req, res));

export default router;
