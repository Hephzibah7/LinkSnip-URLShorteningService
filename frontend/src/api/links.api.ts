import api from './client.js';
import { ApiResponse, LinkItem } from '../types/index.js';

export interface CreateLinkPayload {
  originalUrl: string;
  title?: string;
  customAlias?: string;
  password?: string;
  redirectType?: number;
  expiresAt?: string;
  maxClicks?: number;
  folderId?: string;
  tagIds?: string[];
}

export interface UpdateLinkPayload {
  originalUrl?: string;
  title?: string | null;
  customAlias?: string | null;
  password?: string | null;
  redirectType?: number;
  expiresAt?: string | null;
  maxClicks?: number | null;
  isActive?: boolean;
  folderId?: string | null;
  tagIds?: string[];
}

export interface LinkQueryParams {
  search?: string;
  folderId?: string;
  tagId?: string;
  status?: 'active' | 'expired' | 'disabled' | 'all';
  sortBy?: 'createdAt' | 'clickCount' | 'title' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export const linksApi = {
  createLink: async (payload: CreateLinkPayload) => {
    const res = await api.post<ApiResponse<LinkItem>>('/api/v1/links', payload);
    return res.data;
  },

  getUserLinks: async (params?: LinkQueryParams) => {
    const res = await api.get<ApiResponse<LinkItem[]>>('/api/v1/links', { params });
    return res.data;
  },

  getLinkDetails: async (id: string) => {
    const res = await api.get<ApiResponse<LinkItem>>(`/api/v1/links/${id}`);
    return res.data;
  },

  updateLink: async (id: string, payload: UpdateLinkPayload) => {
    const res = await api.patch<ApiResponse<LinkItem>>(`/api/v1/links/${id}`, payload);
    return res.data;
  },

  deleteLink: async (id: string) => {
    const res = await api.delete<ApiResponse<{ id: string }>>(`/api/v1/links/${id}`);
    return res.data;
  },

  bulkDelete: async (ids: string[]) => {
    const res = await api.post<ApiResponse<{ count: number }>>('/api/v1/links/bulk-delete', { ids });
    return res.data;
  },

  bulkUploadCsv: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post<ApiResponse<any>>('/api/v1/links/bulk', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },

  bulkUploadCsvText: async (csvText: string) => {
    const res = await api.post<ApiResponse<any>>('/api/v1/links/bulk', { csvText });
    return res.data;
  },

  downloadBulkTemplate: async () => {
    const res = await api.get('/api/v1/links/bulk/template', { responseType: 'blob' });
    return res.data;
  },
};
