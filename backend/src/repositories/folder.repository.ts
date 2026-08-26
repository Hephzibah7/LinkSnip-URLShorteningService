import prisma from '../config/prisma.js';
import { Folder, Prisma } from '@prisma/client';

export class FolderRepository {
  async findById(id: string): Promise<Folder | null> {
    return prisma.folder.findUnique({
      where: { id },
      include: {
        _count: {
          select: { links: true },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<(Folder & { _count: { links: number } })[]> {
    return prisma.folder.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { links: true },
        },
      },
    });
  }

  async findByNameAndUserId(name: string, userId: string): Promise<Folder | null> {
    return prisma.folder.findUnique({
      where: {
        userId_name: {
          userId,
          name: name.trim(),
        },
      },
    });
  }

  async create(data: Prisma.FolderCreateInput): Promise<Folder> {
    return prisma.folder.create({
      data: {
        ...data,
        name: data.name.trim(),
      },
    });
  }

  async update(id: string, data: Prisma.FolderUpdateInput): Promise<Folder> {
    return prisma.folder.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Folder> {
    return prisma.folder.delete({
      where: { id },
    });
  }
}

export const folderRepository = new FolderRepository();
