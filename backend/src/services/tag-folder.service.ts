import { tagRepository } from '../repositories/tag.repository.js';
import { folderRepository } from '../repositories/folder.repository.js';

export class TagFolderService {
  // Tags
  async getUserTags(userId: string) {
    return tagRepository.findByUserId(userId);
  }

  async createTag(userId: string, name: string, color?: string) {
    const existing = await tagRepository.findByNameAndUserId(name, userId);
    if (existing) {
      throw new Error(`Tag '${name}' already exists`);
    }
    return tagRepository.create({
      name,
      color: color || '#18181b',
      user: { connect: { id: userId } },
    });
  }

  async updateTag(id: string, userId: string, name: string, color?: string) {
    const tag = await tagRepository.findById(id);
    if (!tag || tag.userId !== userId) {
      throw new Error('Tag not found or unauthorized');
    }
    return tagRepository.update(id, {
      name,
      color,
    });
  }

  async deleteTag(id: string, userId: string) {
    const tag = await tagRepository.findById(id);
    if (!tag || tag.userId !== userId) {
      throw new Error('Tag not found or unauthorized');
    }
    return tagRepository.delete(id);
  }

  // Folders
  async getUserFolders(userId: string) {
    return folderRepository.findByUserId(userId);
  }

  async createFolder(userId: string, name: string, description?: string, color?: string) {
    const existing = await folderRepository.findByNameAndUserId(name, userId);
    if (existing) {
      throw new Error(`Folder '${name}' already exists`);
    }
    return folderRepository.create({
      name,
      description,
      color: color || '#18181b',
      user: { connect: { id: userId } },
    });
  }

  async updateFolder(id: string, userId: string, name: string, description?: string, color?: string) {
    const folder = await folderRepository.findById(id);
    if (!folder || folder.userId !== userId) {
      throw new Error('Folder not found or unauthorized');
    }
    return folderRepository.update(id, {
      name,
      description,
      color,
    });
  }

  async deleteFolder(id: string, userId: string) {
    const folder = await folderRepository.findById(id);
    if (!folder || folder.userId !== userId) {
      throw new Error('Folder not found or unauthorized');
    }
    return folderRepository.delete(id);
  }
}

export const tagFolderService = new TagFolderService();
