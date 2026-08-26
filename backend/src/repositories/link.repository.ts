import prisma from '../config/prisma.js';
import { Link, Prisma } from '@prisma/client';

export interface LinkFilterOptions {
  userId?: string;
  search?: string;
  folderId?: string;
  tagId?: string;
  status?: 'active' | 'expired' | 'disabled' | 'all';
  sortBy?: 'createdAt' | 'clickCount' | 'title' | 'expiresAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export class LinkRepository {
  async findById(id: string): Promise<(Link & { tags: { tag: { id: string; name: string; color: string } }[]; folder: { id: string; name: string; color: string } | null }) | null> {
    return prisma.link.findUnique({
      where: { id },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        folder: true,
      },
    });
  }

  async findByShortCodeOrAlias(slug: string): Promise<(Link & { folder: { id: string; name: string } | null }) | null> {
    return prisma.link.findFirst({
      where: {
        OR: [{ shortCode: slug }, { customAlias: slug }],
      },
      include: {
        folder: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByShortCode(shortCode: string): Promise<Link | null> {
    return prisma.link.findUnique({
      where: { shortCode },
    });
  }

  async findByCustomAlias(customAlias: string): Promise<Link | null> {
    return prisma.link.findUnique({
      where: { customAlias },
    });
  }

  async findUserLinks(options: LinkFilterOptions) {
    const {
      userId,
      search,
      folderId,
      tagId,
      status = 'all',
      sortBy = 'createdAt',
      sortOrder = 'desc',
      page = 1,
      limit = 10,
    } = options;

    const where: Prisma.LinkWhereInput = {};

    if (userId) {
      where.userId = userId;
    }

    if (folderId) {
      where.folderId = folderId;
    }

    if (tagId) {
      where.tags = {
        some: {
          tagId: tagId,
        },
      };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { originalUrl: { contains: search, mode: 'insensitive' } },
        { shortCode: { contains: search, mode: 'insensitive' } },
        { customAlias: { contains: search, mode: 'insensitive' } },
      ];
    }

    const now = new Date();
    if (status === 'active') {
      where.isActive = true;
      where.OR = [
        { expiresAt: null },
        { expiresAt: { gt: now } },
      ];
    } else if (status === 'expired') {
      where.OR = [
        { expiresAt: { lte: now } },
        {
          AND: [
            { maxClicks: { not: null } },
            // Clicks handled via comparison logic
          ],
        },
      ];
    } else if (status === 'disabled') {
      where.isActive = false;
    }

    const skip = (page - 1) * limit;

    const [links, total] = await Promise.all([
      prisma.link.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
        include: {
          tags: {
            include: {
              tag: true,
            },
          },
          folder: true,
          _count: {
            select: {
              clickEvents: true,
            },
          },
        },
      }),
      prisma.link.count({ where }),
    ]);

    return {
      links,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async create(data: Prisma.LinkCreateInput, tagIds?: string[]): Promise<Link> {
    return prisma.link.create({
      data: {
        ...data,
        tags: tagIds && tagIds.length > 0
          ? {
              create: tagIds.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        folder: true,
      },
    });
  }

  async update(id: string, data: Prisma.LinkUpdateInput, tagIds?: string[]): Promise<Link> {
    if (tagIds !== undefined) {
      // First clear existing tags
      await prisma.linkTag.deleteMany({
        where: { linkId: id },
      });

      // Add new tags
      if (tagIds.length > 0) {
        await prisma.linkTag.createMany({
          data: tagIds.map((tagId) => ({
            linkId: id,
            tagId,
          })),
        });
      }
    }

    return prisma.link.update({
      where: { id },
      data,
      include: {
        tags: {
          include: {
            tag: true,
          },
        },
        folder: true,
      },
    });
  }

  async incrementClickCount(id: string): Promise<Link> {
    return prisma.link.update({
      where: { id },
      data: {
        clickCount: {
          increment: 1,
        },
      },
    });
  }

  async delete(id: string): Promise<Link> {
    return prisma.link.delete({
      where: { id },
    });
  }

  async bulkDelete(ids: string[], userId: string): Promise<number> {
    const result = await prisma.link.deleteMany({
      where: {
        id: { in: ids },
        userId,
      },
    });
    return result.count;
  }

  async bulkUpdateStatus(ids: string[], userId: string, isActive: boolean): Promise<number> {
    const result = await prisma.link.updateMany({
      where: {
        id: { in: ids },
        userId,
      },
      data: {
        isActive,
      },
    });
    return result.count;
  }
}

export const linkRepository = new LinkRepository();
