import prisma from '../config/prisma.js';
import { ClickEvent, Prisma } from '@prisma/client';

export interface AnalyticsQueryOptions {
  linkId?: string;
  userId?: string;
  startDate?: Date;
  endDate?: Date;
  interval?: 'hour' | 'day' | 'week' | 'month';
}

export class ClickEventRepository {
  async create(data: Prisma.ClickEventCreateInput): Promise<ClickEvent> {
    return prisma.clickEvent.create({
      data,
    });
  }

  async findByLinkId(linkId: string, page = 1, limit = 50): Promise<{ events: ClickEvent[]; total: number }> {
    const skip = (page - 1) * limit;
    const [events, total] = await Promise.all([
      prisma.clickEvent.findMany({
        where: { linkId },
        orderBy: { timestamp: 'desc' },
        skip,
        take: limit,
      }),
      prisma.clickEvent.count({ where: { linkId } }),
    ]);

    return { events, total };
  }

  async getAllByLinkId(linkId: string): Promise<ClickEvent[]> {
    return prisma.clickEvent.findMany({
      where: { linkId },
      orderBy: { timestamp: 'desc' },
    });
  }

  //Fetch click events based on a link/user/date filter and transform the raw events into analytics data that the frontend can display.
  async getLinkAnalytics(options: AnalyticsQueryOptions) {
    const { linkId, userId, startDate, endDate } = options; //filtering options 

    const where: Prisma.ClickEventWhereInput = {}; //prisma where object initially empty mean sno filtering yet

    if (linkId) {
      where.linkId = linkId;
    } else if (userId) {
      where.link = { userId }; //where:{link:{userId}}
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) where.timestamp.gte = startDate;
      if (endDate) where.timestamp.lte = endDate;
    }

    const [totalClicks, allEvents] = await Promise.all([
      prisma.clickEvent.count({ where }),
      prisma.clickEvent.findMany({
        where,
        select: {
          id: true,
          timestamp: true,
          country: true,
          countryCode: true,
          city: true,
          referrer: true,
          referrerDomain: true,
          deviceType: true,
          os: true,
          browser: true,
          isBot: true,
        },
        orderBy: { timestamp: 'asc' }, //for time series analytics
      }),
    ]);

    // Aggregate by time interval (Daily / Hourly)
    const clicksOverTimeMap = new Map<string, number>();
    const countryMap = new Map<string, { country: string; code: string; count: number }>();
    const cityMap = new Map<string, { city: string; country: string; count: number }>();
    const referrerMap = new Map<string, number>();
    const deviceMap = new Map<string, number>();
    const osMap = new Map<string, number>();
    const browserMap = new Map<string, number>();

    for (const ev of allEvents) {
      // Format date for time series: YYYY-MM-DD
      const dateKey = ev.timestamp.toISOString().split('T')[0];
      clicksOverTimeMap.set(dateKey, (clicksOverTimeMap.get(dateKey) || 0) + 1);

      // Countries
      const countryName = ev.country || 'Unknown';
      const countryCode = ev.countryCode || 'XX';
      const existingCountry = countryMap.get(countryName) || { country: countryName, code: countryCode, count: 0 };
      existingCountry.count += 1;
      countryMap.set(countryName, existingCountry);

      // Cities
      if (ev.city && ev.city !== 'Unknown') {
        const cityKey = `${ev.city}, ${ev.countryCode}`;
        const existingCity = cityMap.get(cityKey) || { city: ev.city, country: ev.country || 'Unknown', count: 0 };
        existingCity.count += 1;
        cityMap.set(cityKey, existingCity);
      }

      // Referrers
      const ref = ev.referrerDomain || 'Direct';
      referrerMap.set(ref, (referrerMap.get(ref) || 0) + 1);

      // Devices
      const dev = ev.deviceType || 'Desktop';
      deviceMap.set(dev, (deviceMap.get(dev) || 0) + 1);

      // OS
      const osName = ev.os ? ev.os.split(' ')[0] : 'Unknown';
      osMap.set(osName, (osMap.get(osName) || 0) + 1);

      // Browsers
      const browserName = ev.browser ? ev.browser.split(' ')[0] : 'Unknown';
      browserMap.set(browserName, (browserMap.get(browserName) || 0) + 1);
    }

    const clicksOverTime = Array.from(clicksOverTimeMap.entries()).map(([date, clicks]) => ({
      date,
      clicks,
    }));

    const topCountries = Array.from(countryMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((item) => ({
        ...item,
        percentage: totalClicks > 0 ? Math.round((item.count / totalClicks) * 100 * 10) / 10 : 0,
      }));

    const topCities = Array.from(cityMap.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const topReferrers = Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({
        referrer,
        count,
        percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100 * 10) / 10 : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const deviceBreakdown = Array.from(deviceMap.entries()).map(([device, count]) => ({
      device,
      count,
      percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100 * 10) / 10 : 0,
    }));

    const osBreakdown = Array.from(osMap.entries()).map(([os, count]) => ({
      os,
      count,
      percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100 * 10) / 10 : 0,
    }));

    const browserBreakdown = Array.from(browserMap.entries()).map(([browser, count]) => ({
      browser,
      count,
      percentage: totalClicks > 0 ? Math.round((count / totalClicks) * 100 * 10) / 10 : 0,
    }));

    return {
      totalClicks,
      clicksOverTime,
      topCountries,
      topCities,
      topReferrers,
      deviceBreakdown,
      osBreakdown,
      browserBreakdown,
    };
  }
}

export const clickEventRepository = new ClickEventRepository();
