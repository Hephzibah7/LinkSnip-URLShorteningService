import api from './client.js';
import { ApiResponse } from '../types/index.js';

export const redirectApi = {
  checkStatus: async (slug: string, password?: string) => {
    const res = await api.post<ApiResponse<{ status: string; targetUrl?: string; redirectType?: number; title?: string; reason?: string }>>(
      `/api/v1/redirect/status/${encodeURIComponent(slug)}`,
      { password }
    );
    return res.data;
  },

  unlockProtectedLink: async (slug: string, password: string) => {
    const res = await api.post<ApiResponse<{ targetUrl: string; redirectType: number }>>(
      `/api/v1/redirect/unlock/${encodeURIComponent(slug)}`,
      { password }
    );
    return res.data;
  },
};
