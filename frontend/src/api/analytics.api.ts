import api from './client.js';
import { ApiResponse, AnalyticsData, ClickEventItem } from '../types/index.js';

export const analyticsApi = {
  getLinkAnalytics: async (linkId: string, startDate?: string, endDate?: string) => {
    const res = await api.get<ApiResponse<AnalyticsData>>(`/api/v1/analytics/${linkId}`, {
      params: { startDate, endDate },
    });
    return res.data;
  },

  getUserOverview: async (startDate?: string, endDate?: string) => {
    const res = await api.get<ApiResponse<AnalyticsData>>('/api/v1/analytics/overview', {
      params: { startDate, endDate },
    });
    return res.data;
  },

  getClickLogs: async (linkId: string, page = 1, limit = 50) => {
    const res = await api.get<ApiResponse<ClickEventItem[]>>(`/api/v1/analytics/${linkId}/logs`, {
      params: { page, limit },
    });
    return res.data;
  },

  exportCsv: async (linkId: string) => {
    const res = await api.get(`/api/v1/analytics/${linkId}/export`, {
      responseType: 'blob',
    });
    return res.data;
  },
};
