import { z } from 'zod';

export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color code').optional(),
});

export const updateTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(50, 'Tag name is too long'),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color code').optional(),
});

export const createFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(50, 'Folder name is too long'),
  description: z.string().max(200, 'Description is too long').optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color code').optional(),
});

export const updateFolderSchema = z.object({
  name: z.string().min(1, 'Folder name is required').max(50, 'Folder name is too long'),
  description: z.string().max(200, 'Description is too long').optional().nullable(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Invalid hex color code').optional(),
});
