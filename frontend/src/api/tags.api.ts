import api from './client.js';
import { ApiResponse, Tag, Folder } from '../types/index.js';

export const tagsApi = {
  // Tags
  getTags: async () => {
    const res = await api.get<ApiResponse<Tag[]>>('/api/v1/tags');
    return res.data;
  },

  createTag: async (name: string, color?: string) => {
    const res = await api.post<ApiResponse<Tag>>('/api/v1/tags', { name, color });
    return res.data;
  },

  updateTag: async (id: string, name: string, color?: string) => {
    const res = await api.patch<ApiResponse<Tag>>(`/api/v1/tags/${id}`, { name, color });
    return res.data;
  },

  deleteTag: async (id: string) => {
    const res = await api.delete<ApiResponse<{ id: string }>>(`/api/v1/tags/${id}`);
    return res.data;
  },

  // Folders
  getFolders: async () => {
    const res = await api.get<ApiResponse<Folder[]>>('/api/v1/folders');
    return res.data;
  },

  createFolder: async (name: string, description?: string, color?: string) => {
    const res = await api.post<ApiResponse<Folder>>('/api/v1/folders', { name, description, color });
    return res.data;
  },

  updateFolder: async (id: string, name: string, description?: string, color?: string) => {
    const res = await api.patch<ApiResponse<Folder>>(`/api/v1/folders/${id}`, { name, description, color });
    return res.data;
  },

  deleteFolder: async (id: string) => {
    const res = await api.delete<ApiResponse<{ id: string }>>(`/api/v1/folders/${id}`);
    return res.data;
  },
};
