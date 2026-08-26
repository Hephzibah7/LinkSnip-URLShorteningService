import { config } from '../config/env.js';
import { logger } from '../utils/logger.js';

export interface SafeBrowsingResult {
  isSafe: boolean;
  threatType?: string;
  reason?: string;
}

// Suspicious patterns / known mock malicious signatures
const KNOWN_MALICIOUS_DOMAINS = [
  'malware.testing.google.test',
  'phishing.example.com',
  'account-security-update-paypal.fake.com',
  'free-crypto-giveaway-airdrop.xyz',
  'stealer-download.net',
  'malicious-url-test.com',
  'phishing-test.org',
];

const SUSPICIOUS_KEYWORDS = [
  'banking-security-update',
  'verify-your-seed-phrase',
  'claim-free-robux',
  'steamcommunity-nitro-gift',
  'free-discord-nitro-gen',
  'metamask-restore-wallet',
  'apple-id-verify-alert',
];

export class SafeBrowsingService {
  /**
   * Checks if a URL is safe against Google Safe Browsing API or built-in heuristic/reputation filter
   */
  async checkUrl(url: string): Promise<SafeBrowsingResult> {
    try {
      const parsedUrl = new URL(url);
      const hostname = parsedUrl.hostname.toLowerCase();

      // 1. Check known blacklist
      for (const malDomain of KNOWN_MALICIOUS_DOMAINS) {
        if (hostname === malDomain || hostname.endsWith(`.${malDomain}`)) {
          return {
            isSafe: false,
            threatType: 'MALWARE_OR_PHISHING',
            reason: `URL matches blacklisted threat domain: ${hostname}`,
          };
        }
      }

      // 2. Check suspicious keyword heuristics
      const fullUrlLower = url.toLowerCase();
      for (const keyword of SUSPICIOUS_KEYWORDS) {
        if (fullUrlLower.includes(keyword)) {
          return {
            isSafe: false,
            threatType: 'SUSPICIOUS_PHISHING',
            reason: `URL contains deceptive phishing keyword pattern: "${keyword}"`,
          };
        }
      }

      // 3. Check Google Safe Browsing API if key is provided
      if (config.safeBrowsingApiKey) {
        try {
          const endpoint = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${config.safeBrowsingApiKey}`;
          const body = {
            client: {
              clientId: 'linksnip',
              clientVersion: '1.0.0',
            },
            threatInfo: {
              threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE', 'POTENTIALLY_HARMFUL_APPLICATION'],
              platformTypes: ['ANY_PLATFORM'],
              threatEntryTypes: ['URL'],
              threatEntries: [{ url }],
            },
          };

          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          });

          if (response.ok) {
            const data = (await response.json()) as any;
            if (data.matches && data.matches.length > 0) {
              const match = data.matches[0];
              return {
                isSafe: false,
                threatType: match.threatType,
                reason: `Google Safe Browsing detected threat: ${match.threatType}`,
              };
            }
          }
        } catch (apiError) {
          logger.warn('Google Safe Browsing API call failed, falling back to local heuristics:', apiError);
        }
      }

      return { isSafe: true };
    } catch (error) {
      return {
        isSafe: false,
        threatType: 'INVALID_URL',
        reason: 'Malformed URL provided',
      };
    }
  }
}

export const safeBrowsingService = new SafeBrowsingService();
