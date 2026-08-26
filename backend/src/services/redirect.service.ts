import bcrypt from 'bcryptjs';
import { linkRepository } from '../repositories/link.repository.js';
import { clickEventRepository } from '../repositories/click-event.repository.js';
import { getGeoFromIp } from '../utils/geo.js';
import { parseUserAgent, extractReferrerDomain } from '../utils/user-agent.js';
import { logger } from '../utils/logger.js';

export interface ResolveRedirectOptions {
  slug: string;
  ip?: string;
  referrer?: string;
  userAgent?: string;
  password?: string;
}

export type RedirectStatus =
  | 'REDIRECT'
  | 'PASSWORD_REQUIRED'
  | 'PASSWORD_INVALID'
  | 'EXPIRED'
  | 'DISABLED'
  | 'NOT_FOUND';

export interface RedirectResolutionResult {
  status: RedirectStatus;
  targetUrl?: string;
  redirectType?: number;
  linkId?: string;
  title?: string;
  reason?: string;
}

export class RedirectService {
  /**
   * Resolves short link and schedules async click event ingestion
   */
  async resolveRedirect(options: ResolveRedirectOptions): Promise<RedirectResolutionResult> {
    const { slug, ip, referrer, userAgent, password } = options;

    const link = await linkRepository.findByShortCodeOrAlias(slug);
    if (!link) {
      return { status: 'NOT_FOUND', reason: 'Link not found' };
    }

    // 1. Check if disabled/inactive
    if (!link.isActive) {
      return {
        status: 'DISABLED',
        linkId: link.id,
        title: link.title || undefined,
        reason: 'This link has been deactivated by its owner.',
      };
    }

    // 2. Check expiration (date or click count limit)
    const now = new Date();
    const isDateExpired = link.expiresAt !== null && new Date(link.expiresAt) <= now;
    const isClicksExpired = link.maxClicks !== null && link.clickCount >= link.maxClicks;

    if (isDateExpired || isClicksExpired) {
      return {
        status: 'EXPIRED',
        linkId: link.id,
        title: link.title || undefined,
        reason: isDateExpired
          ? 'This link has expired based on its set expiration date.'
          : 'This link has reached its maximum allowed click limit.',
      };
    }

    // 3. Check password protection
    if (link.passwordHash) {
      if (!password) {
        return {
          status: 'PASSWORD_REQUIRED',
          linkId: link.id,
          title: link.title || undefined,
          reason: 'This link is password-protected.',
        };
      }

      const isPasswordValid = await bcrypt.compare(password, link.passwordHash);
      if (!isPasswordValid) {
        return {
          status: 'PASSWORD_INVALID',
          linkId: link.id,
          title: link.title || undefined,
          reason: 'Incorrect password entered.',
        };
      }
    }

    // 4. Asynchronous Click Event Ingestion (Queue non-blocking)
    this.recordClickEventAsync(link.id, ip, referrer, userAgent);

    return {
      status: 'REDIRECT',
      targetUrl: link.originalUrl,
      redirectType: link.redirectType === 301 ? 301 : 302,
      linkId: link.id,
      title: link.title || undefined,
    };
  }

  /**
   * Non-blocking background click logger
   */
  private recordClickEventAsync(linkId: string, ip?: string, referrer?: string, userAgent?: string): void {
    // Process asynchronously without blocking response
    setImmediate(async () => {
      try {
        const geo = getGeoFromIp(ip);
        const device = parseUserAgent(userAgent);
        const referrerDomain = extractReferrerDomain(referrer);

        await Promise.all([
          clickEventRepository.create({
            link: { connect: { id: linkId } },
            ipAddress: ip || 'Unknown',
            country: geo.country,
            countryCode: geo.countryCode,
            city: geo.city,
            region: geo.region,
            referrer: referrer || null,
            referrerDomain,
            userAgent: userAgent || null,
            deviceType: device.deviceType,
            os: device.os,
            browser: device.browser,
            isBot: device.isBot,
          }),
          linkRepository.incrementClickCount(linkId),
        ]);
      } catch (err) {
        logger.error('Failed to log click event asynchronously:', err);
      }
    });
  }
}

export const redirectService = new RedirectService();
