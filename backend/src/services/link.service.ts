import bcrypt from 'bcryptjs';
import { linkRepository, LinkFilterOptions } from '../repositories/link.repository.js';
import { tagRepository } from '../repositories/tag.repository.js';
import { generateRandomShortCode, isValidCustomAlias } from '../utils/base62.js';
import { safeBrowsingService } from './safe-browsing.service.js';
import { qrService } from './qr.service.js';
import { csvService, BulkLinkCsvRow } from './csv.service.js';
import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface CreateLinkDto {
  userId?: string;
  originalUrl: string;
  title?: string;
  customAlias?: string;
  password?: string;
  redirectType?: number;
  expiresAt?: Date | string;
  maxClicks?: number;
  folderId?: string;
  tagIds?: string[];
}

export interface UpdateLinkDto {
  title?: string;
  originalUrl?: string;
  customAlias?: string | null;
  password?: string | null;
  redirectType?: number;
  expiresAt?: Date | string | null;
  maxClicks?: number | null;
  isActive?: boolean;
  folderId?: string | null;
  tagIds?: string[];
}

export class LinkService {
  /**
   * Normalizes a URL and validates it
   */
  normalizeUrl(rawUrl: string): string {
    let url = rawUrl.trim();
    if (!/^https?:\/\//i.test(url)) {
      url = `https://${url}`;
    }
    const parsed = new URL(url);
    return parsed.toString();
  }

  /**
   * Generates a unique Base62 short code with collision handling
   */
  async generateUniqueShortCode(length: number = 6): Promise<string> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const code = generateRandomShortCode(length);
      const existing = await linkRepository.findByShortCodeOrAlias(code);
      if (!existing) {
        return code;
      }
      attempts++;
    }

    // In the unlikely event of 10 collisions with length 6, increase length to 7
    return generateRandomShortCode(7);
  }

  /**
   * Creates a single short link (authenticated or guest)
   */
  async createLink(dto: CreateLinkDto) {
    const originalUrl = this.normalizeUrl(dto.originalUrl);

    // 1. Safe Browsing & Threat Check
    const threatCheck = await safeBrowsingService.checkUrl(originalUrl);
    if (!threatCheck.isSafe) {
      throw new Error(`Cannot shorten unsafe URL: ${threatCheck.reason || 'Malicious or phishing URL detected'}`);
    }

    // 2. Custom Alias Check
    let customAlias: string | undefined = undefined;
    if (dto.customAlias && dto.customAlias.trim()) {
      const cleanAlias = dto.customAlias.trim();
      const aliasValidation = isValidCustomAlias(cleanAlias);
      if (!aliasValidation.valid) {
        throw new Error(aliasValidation.reason || 'Invalid custom alias');
      }

      const existingAlias = await linkRepository.findByShortCodeOrAlias(cleanAlias);
      if (existingAlias) {
        throw new Error(`Custom alias '${cleanAlias}' is already in use`);
      }
      customAlias = cleanAlias;
    }

    // 3. Generate Unique Short Code
    const shortCode = await this.generateUniqueShortCode(10);

    // 4. Hash password if provided
    let passwordHash: string | undefined = undefined;
    if (dto.password && dto.password.trim()) {
      const salt = await bcrypt.genSalt(10);
      passwordHash = await bcrypt.hash(dto.password.trim(), salt);
    }

    // 5. Expiration Date
    let expiresAt: Date | undefined = undefined;
    if (dto.expiresAt) {
      expiresAt = new Date(dto.expiresAt);
      if (isNaN(expiresAt.getTime())) {
        throw new Error('Invalid expiration date format');
      }
      if (expiresAt <= new Date()) {
        throw new Error('Expiration date must be in the future');
      }
    }

    // 6. Title fallback to hostname if not provided
    let title = dto.title?.trim();
    if (!title) {
      try {
        const u = new URL(originalUrl);
        title = u.hostname.replace(/^www\./, '');
      } catch {
        title = originalUrl;
      }
    }

    const createdLink = await linkRepository.create(
      {
        originalUrl,
        shortCode,
        customAlias: customAlias || null,
        title,
        passwordHash: passwordHash || null,
        redirectType: dto.redirectType === 301 ? 301 : 302,
        expiresAt: expiresAt || null,
        maxClicks: dto.maxClicks ? Math.max(1, Math.floor(dto.maxClicks)) : null,
        isActive: true,
        isMalicious: false,
        user: dto.userId ? { connect: { id: dto.userId } } : undefined,
        folder: dto.folderId ? { connect: { id: dto.folderId } } : undefined,
      },
      dto.tagIds
    );

    const fullShortUrl = `${config.baseUrl}/${customAlias || shortCode}`;
    const qrDataUrl = await qrService.generateDataUrl(fullShortUrl);

    return {
      ...createdLink,
      shortUrl: fullShortUrl,
      qrDataUrl,
    };
  }

  /**
   * Updates an existing link
   */
  async updateLink(id: string, userId: string, dto: UpdateLinkDto) {
    const existing = await linkRepository.findById(id);
    if (!existing) {
      throw new Error('Link not found');
    }
    if (existing.userId !== userId) {
      throw new Error('Unauthorized to modify this link');
    }

    let originalUrl = existing.originalUrl;
    if (dto.originalUrl && dto.originalUrl.trim() !== existing.originalUrl) {
      originalUrl = this.normalizeUrl(dto.originalUrl);
      const threatCheck = await safeBrowsingService.checkUrl(originalUrl);
      if (!threatCheck.isSafe) {
        throw new Error(`Cannot update to unsafe URL: ${threatCheck.reason}`);
      }
    }

    let customAlias = existing.customAlias;
    if (dto.customAlias !== undefined) {
      if (dto.customAlias === null || dto.customAlias.trim() === '') {
        customAlias = null;
      } else {
        const cleanAlias = dto.customAlias.trim();
        if (cleanAlias !== existing.customAlias) {
          const aliasValidation = isValidCustomAlias(cleanAlias);
          if (!aliasValidation.valid) {
            throw new Error(aliasValidation.reason);
          }
          const duplicate = await linkRepository.findByShortCodeOrAlias(cleanAlias);
          if (duplicate && duplicate.id !== id) {
            throw new Error(`Custom alias '${cleanAlias}' is already in use`);
          }
          customAlias = cleanAlias;
        }
      }
    }

    let passwordHash = existing.passwordHash;
    if (dto.password !== undefined) {
      if (dto.password === null || dto.password.trim() === '') {
        passwordHash = null;
      } else {
        const salt = await bcrypt.genSalt(10);
        passwordHash = await bcrypt.hash(dto.password.trim(), salt);
      }
    }

    let expiresAt = existing.expiresAt;
    if (dto.expiresAt !== undefined) {
      if (dto.expiresAt === null) {
        expiresAt = null;
      } else {
        expiresAt = new Date(dto.expiresAt);
        if (isNaN(expiresAt.getTime())) {
          throw new Error('Invalid expiration date');
        }
      }
    }

    const updated = await linkRepository.update(
      id,
      {
        originalUrl,
        title: dto.title !== undefined ? dto.title?.trim() : existing.title,
        customAlias,
        passwordHash,
        redirectType: dto.redirectType !== undefined ? (dto.redirectType === 301 ? 301 : 302) : existing.redirectType,
        expiresAt,
        maxClicks: dto.maxClicks !== undefined ? dto.maxClicks : existing.maxClicks,
        isActive: dto.isActive !== undefined ? dto.isActive : existing.isActive,
        folder: dto.folderId !== undefined ? (dto.folderId ? { connect: { id: dto.folderId } } : { disconnect: true }) : undefined,
      },
      dto.tagIds
    );

    const fullShortUrl = `${config.baseUrl}/${updated.customAlias || updated.shortCode}`;
    const qrDataUrl = await qrService.generateDataUrl(fullShortUrl);

    return {
      ...updated,
      shortUrl: fullShortUrl,
      qrDataUrl,
    };
  }

  /**
   * Retrieves paginated links with filters for a user
   */
  async getUserLinks(options: LinkFilterOptions) {
    const result = await linkRepository.findUserLinks(options);
    const linksWithMeta = result.links.map((link) => {
      const fullShortUrl = `${config.baseUrl}/${link.customAlias || link.shortCode}`;
      return {
        ...link,
        shortUrl: fullShortUrl,
        isPasswordProtected: Boolean(link.passwordHash),
        isExpired:
          (link.expiresAt !== null && new Date(link.expiresAt) <= new Date()) ||
          (link.maxClicks !== null && link.clickCount >= link.maxClicks),
      };
    });

    return {
      links: linksWithMeta,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  /**
   * Retrieves single link details with QR data
   */
  async getLinkDetails(id: string, userId?: string) {
    const link = await linkRepository.findById(id);
    if (!link) {
      throw new Error('Link not found');
    }

    if (userId && link.userId && link.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const fullShortUrl = `${config.baseUrl}/${link.customAlias || link.shortCode}`;
    const qrDataUrl = await qrService.generateDataUrl(fullShortUrl);
    const qrSvg = await qrService.generateSvg(fullShortUrl);

    return {
      ...link,
      shortUrl: fullShortUrl,
      qrDataUrl,
      qrSvg,
      isPasswordProtected: Boolean(link.passwordHash),
      isExpired:
        (link.expiresAt !== null && new Date(link.expiresAt) <= new Date()) ||
        (link.maxClicks !== null && link.clickCount >= link.maxClicks),
    };
  }

  /**
   * Deletes a link
   */
  async deleteLink(id: string, userId: string) {
    const link = await linkRepository.findById(id);
    if (!link) {
      throw new Error('Link not found');
    }
    if (link.userId !== userId) {
      throw new Error('Unauthorized');
    }
    return linkRepository.delete(id);
  }

  /**
   * Bulk deletes links
   */
  async bulkDelete(ids: string[], userId: string) {
    return linkRepository.bulkDelete(ids, userId);
  }

  /**
   * Bulk creates links from CSV upload
   */
  async bulkCreateFromCsv(userId: string, fileBuffer: Buffer | string) {
    const parsed = csvService.parseBulkCsv(fileBuffer);
    const results: any[] = [];
    const errors: { row: number; reason: string }[] = [...parsed.invalidRows.map((r) => ({ row: r.row, reason: r.reason }))];

    for (let i = 0; i < parsed.validRows.length; i++) {
      const row = parsed.validRows[i];
      const rowIndex = i + 2;

      try {
        // Find or create tags if specified
        let tagIds: string[] = [];
        if (row.tags) {
          const tagNames = row.tags.split(',').map((t) => t.trim()).filter(Boolean);
          for (const tName of tagNames) {
            let tag = await tagRepository.findByNameAndUserId(tName, userId);
            if (!tag) {
              tag = await tagRepository.create({
                name: tName,
                user: { connect: { id: userId } },
              });
            }
            tagIds.push(tag.id);
          }
        }

        const created = await this.createLink({
          userId,
          originalUrl: row.url,
          title: row.title,
          customAlias: row.customAlias,
          expiresAt: row.expiresAt,
          maxClicks: row.maxClicks ? Number(row.maxClicks) : undefined,
          tagIds,
        });

        results.push(created);
      } catch (err: any) {
        errors.push({
          row: rowIndex,
          reason: err.message || 'Failed to create link',
        });
      }
    }

    return {
      totalProcessed: parsed.totalRows,
      successful: results.length,
      failed: errors.length,
      createdLinks: results,
      errors,
    };
  }
}

export const linkService = new LinkService();
