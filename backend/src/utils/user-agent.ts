import { UAParser } from 'ua-parser-js';

export interface DeviceInfo {
  deviceType: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot' | 'Unknown';
  os: string;
  browser: string;
  isBot: boolean;
}

const BOT_PATTERNS = [
  /bot/i,
  /crawler/i,
  /spider/i,
  /facebookexternalhit/i,
  /whatsapp/i,
  /twitterbot/i,
  /telegrambot/i,
  /slackbot/i,
  /linkedinbot/i,
  /googlebot/i,
  /bingbot/i,
  /yandexbot/i,
  /duckduckbot/i,
  /curl/i,
  /wget/i,
  /postman/i,
];

export function parseUserAgent(userAgentString: string | undefined): DeviceInfo {
  if (!userAgentString) {
    return {
      deviceType: 'Desktop',
      os: 'Unknown',
      browser: 'Unknown',
      isBot: false,
    };
  }

  const isBot = BOT_PATTERNS.some((pattern) => pattern.test(userAgentString));
  if (isBot) {
    return {
      deviceType: 'Bot',
      os: 'Bot',
      browser: 'Bot Crawler',
      isBot: true,
    };
  }

  const parser = new UAParser(userAgentString);
  const result = parser.getResult();

  let deviceType: DeviceInfo['deviceType'] = 'Desktop';
  if (result.device.type === 'mobile') {
    deviceType = 'Mobile';
  } else if (result.device.type === 'tablet') {
    deviceType = 'Tablet';
  } else if (result.device.type) {
    deviceType = 'Desktop';
  }

  const os = result.os.name ? `${result.os.name}${result.os.version ? ' ' + result.os.version : ''}` : 'Unknown OS';
  const browser = result.browser.name
    ? `${result.browser.name}${result.browser.major ? ' ' + result.browser.major : ''}`
    : 'Unknown Browser';

  return {
    deviceType,
    os,
    browser,
    isBot: false,
  };
}

export function extractReferrerDomain(referrer: string | undefined): string {
  if (!referrer || referrer.trim() === '') {
    return 'Direct';
  }

  try {
    const url = new URL(referrer);
    let hostname = url.hostname.replace(/^www\./, '');
    if (hostname.includes('google.')) return 'Google';
    if (hostname.includes('t.co') || hostname.includes('twitter.com') || hostname.includes('x.com')) return 'Twitter / X';
    if (hostname.includes('facebook.com') || hostname.includes('fb.com')) return 'Facebook';
    if (hostname.includes('linkedin.com')) return 'LinkedIn';
    if (hostname.includes('reddit.com')) return 'Reddit';
    if (hostname.includes('instagram.com')) return 'Instagram';
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) return 'YouTube';
    if (hostname.includes('github.com')) return 'GitHub';
    if (hostname.includes('tiktok.com')) return 'TikTok';
    if (hostname.includes('pinterest.com')) return 'Pinterest';
    return hostname;
  } catch {
    return referrer.length > 30 ? referrer.substring(0, 30) + '...' : referrer;
  }
}
