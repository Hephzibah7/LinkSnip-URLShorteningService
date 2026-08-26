import { clickEventRepository } from '../repositories/click-event.repository.js';
import { linkRepository } from '../repositories/link.repository.js';
import { csvService } from './csv.service.js';

export interface DateFilterOptions {
  startDate?: string | Date;
  endDate?: string | Date;
}

export class AnalyticsService {
  /**
   * Retrieves comprehensive analytics for a single link
   */
  async getLinkAnalytics(linkId: string, userId?: string, dateFilters?: DateFilterOptions) {
    const link = await linkRepository.findById(linkId);
    if (!link) {
      throw new Error('Link not found');
    }

    if (userId && link.userId && link.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const startDate = dateFilters?.startDate ? new Date(dateFilters.startDate) : undefined;
    const endDate = dateFilters?.endDate ? new Date(dateFilters.endDate) : undefined;

    const analytics = await clickEventRepository.getLinkAnalytics({
      linkId,
      startDate,
      endDate,
    });

    return {
      link: {
        id: link.id,
        title: link.title,
        originalUrl: link.originalUrl,
        shortCode: link.shortCode,
        customAlias: link.customAlias,
        clickCount: link.clickCount,
        createdAt: link.createdAt,
      },
      ...analytics,
    };
  }

  /**
   * Retrieves aggregated analytics across all user links
   */
  async getUserOverviewAnalytics(userId: string, dateFilters?: DateFilterOptions) {
    const startDate = dateFilters?.startDate ? new Date(dateFilters.startDate) : undefined;
    const endDate = dateFilters?.endDate ? new Date(dateFilters.endDate) : undefined;

    const analytics = await clickEventRepository.getLinkAnalytics({
      userId,
      startDate,
      endDate,
    });

    const userLinksResult = await linkRepository.findUserLinks({ userId, limit: 1000 });
    const totalLinks = userLinksResult.total;
    const activeLinks = userLinksResult.links.filter((l: any) => l.isActive && (!l.expiresAt || new Date(l.expiresAt) > new Date())).length;

    return {
      totalLinks,
      activeLinks,
      ...analytics,
    };
  }

  /**
   * Exports raw click event log for a link as CSV
   */
  async exportLinkAnalyticsCsv(linkId: string, userId?: string): Promise<string> {
    const link = await linkRepository.findById(linkId);
    if (!link) {
      throw new Error('Link not found');
    }
    if (userId && link.userId && link.userId !== userId) {
      throw new Error('Unauthorized');
    }

    const events = await clickEventRepository.getAllByLinkId(linkId);
    return csvService.exportAnalyticsToCsv(events);
  }

  /**
   * Retrieves paginated raw click events
   */
  async getClickEventLogs(linkId: string, userId?: string, page = 1, limit = 50) {
    const link = await linkRepository.findById(linkId);
    if (!link) {
      throw new Error('Link not found');
    }
    if (userId && link.userId && link.userId !== userId) {
      throw new Error('Unauthorized');
    }

    return clickEventRepository.findByLinkId(linkId, page, limit);
  }
}

export const analyticsService = new AnalyticsService();
