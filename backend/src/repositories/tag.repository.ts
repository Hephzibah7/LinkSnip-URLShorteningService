import prisma from '../config/prisma.js';
import { Tag, Prisma } from '@prisma/client';

export class TagRepository {
  async findById(id: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: { id },
      include: {
        _count: {
          select: { links: true },
        },
      },
    });
  }

  async findByUserId(userId: string): Promise<(Tag & { _count: { links: number } })[]> {
    return prisma.tag.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
      include: {
        _count: {
          select: { links: true },
        },
      },
    });
  }

  async findByNameAndUserId(name: string, userId: string): Promise<Tag | null> {
    return prisma.tag.findUnique({
      where: {
        userId_name: {
          userId,
          name: name.trim(),
        },
      },
    });
  }

  async create(data: Prisma.TagCreateInput): Promise<Tag> {
    return prisma.tag.create({
      data: {
        ...data,
        name: data.name.trim(),
      },
    });
  }

  async update(id: string, data: Prisma.TagUpdateInput): Promise<Tag> {
    return prisma.tag.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Tag> {
    return prisma.tag.delete({
      where: { id },
    });
  }
}

export const tagRepository = new TagRepository();
