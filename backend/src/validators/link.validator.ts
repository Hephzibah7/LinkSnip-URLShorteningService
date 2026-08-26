import { z } from 'zod';

export const createLinkSchema = z.object({
  originalUrl: z.string().min(1, 'URL is required'),
  title: z.string().max(200, 'Title is too long').optional(),
  customAlias: z
    .string()
    .min(3, 'Alias must be at least 3 characters')
    .max(30, 'Alias cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Alias can only contain alphanumeric characters, underscores, and hyphens')
    .optional()
    .or(z.literal('')),
  password: z.string().max(100, 'Password is too long').optional().or(z.literal('')),
  redirectType: z.union([z.literal(301), z.literal(302), z.literal('301'), z.literal('302')]).optional().transform((val) => (val ? Number(val) : 302)),
  expiresAt: z.string().optional().or(z.literal('')),
  maxClicks: z.union([z.number(), z.string()]).optional().transform((val) => (val ? Number(val) : undefined)),
  folderId: z.string().uuid('Invalid folder ID').optional().or(z.literal('')),
  tagIds: z.array(z.string().uuid('Invalid tag ID')).optional(),
});

export const updateLinkSchema = z.object({
  originalUrl: z.string().min(1, 'URL is required').optional(),
  title: z.string().max(200, 'Title is too long').optional().nullable(),
  customAlias: z
    .string()
    .min(3, 'Alias must be at least 3 characters')
    .max(30, 'Alias cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Alias can only contain alphanumeric characters, underscores, and hyphens')
    .optional()
    .nullable()
    .or(z.literal('')),
  password: z.string().max(100, 'Password is too long').optional().nullable().or(z.literal('')),
  redirectType: z.union([z.literal(301), z.literal(302), z.literal('301'), z.literal('302')]).optional().transform((val) => (val !== undefined ? Number(val) : undefined)),
  expiresAt: z.string().optional().nullable().or(z.literal('')),
  maxClicks: z.union([z.number(), z.string()]).optional().nullable().transform((val) => (val ? Number(val) : val === null ? null : undefined)),
  isActive: z.boolean().optional(),
  folderId: z.string().uuid('Invalid folder ID').optional().nullable().or(z.literal('')),
  tagIds: z.array(z.string().uuid('Invalid tag ID')).optional(),
});

export const bulkDeleteSchema = z.object({
  ids: z.array(z.string()).min(1, 'Please select at least one link to delete'),
});

export const unlockLinkSchema = z.object({
  password: z.string().min(1, 'Password is required'),
});

export const queryLinkSchema = z.object({
  search: z.string().optional(),
  folderId: z.string().optional(),
  tagId: z.string().optional(),
  status: z.enum(['active', 'expired', 'disabled', 'all']).optional(),
  sortBy: z.enum(['createdAt', 'clickCount', 'title', 'expiresAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 1)),
  limit: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 10)),
});
