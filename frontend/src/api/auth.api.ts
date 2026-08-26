import api from './client.js';
import { ApiResponse, User } from '../types/index.js';

export const authApi = {
  register: async (data: { email: string; name: string; password: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string; verificationToken?: string }>>('/api/v1/auth/register', data);
    return res.data;
  },

  login: async (data: { email: string; password: string }) => {
    const res = await api.post<ApiResponse<{ user: User; token: string }>>('/api/v1/auth/login', data);
    return res.data;
  },

  verifyEmail: async (token: string) => {
    const res = await api.post<ApiResponse>('/api/v1/auth/verify-email', { token });
    return res.data;
  },

  forgotPassword: async (email: string) => {
    const res = await api.post<ApiResponse<{ resetToken?: string }>>('/api/v1/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (data: { token: string; newPassword: string }) => {
    const res = await api.post<ApiResponse>('/api/v1/auth/reset-password', data);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get<ApiResponse<User>>('/api/v1/auth/me');
    return res.data;
  },

  regenerateApiKey: async () => {
    const res = await api.post<ApiResponse<{ apiKey: string }>>('/api/v1/auth/regenerate-api-key');
    return res.data;
  },
};
