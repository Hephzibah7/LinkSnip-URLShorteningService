export interface User {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  apiKey?: string | null;
  createdAt?: string;
  totalLinks?: number;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
  _count?: {
    links: number;
  };
}

export interface Folder {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  color: string;
  createdAt: string;
  _count?: {
    links: number;
  };
}

export interface LinkItem {
  id: string;
  userId?: string | null;
  title?: string | null;
  originalUrl: string;
  shortCode: string;
  customAlias?: string | null;
  shortUrl: string;
  passwordHash?: string | null;
  isPasswordProtected: boolean;
  redirectType: number;
  expiresAt?: string | null;
  maxClicks?: number | null;
  clickCount: number;
  isActive: boolean;
  isExpired: boolean;
  isMalicious: boolean;
  folderId?: string | null;
  folder?: {
    id: string;
    name: string;
    color?: string;
  } | null;
  tags?: {
    tag: Tag;
  }[];
  qrDataUrl?: string;
  qrSvg?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    clickEvents: number;
  };
}

export interface ClickEventItem {
  id: string;
  linkId: string;
  timestamp: string;
  ipAddress?: string;
  country?: string;
  countryCode?: string;
  city?: string;
  region?: string;
  referrer?: string;
  referrerDomain?: string;
  deviceType?: 'Desktop' | 'Mobile' | 'Tablet' | 'Bot';
  os?: string;
  browser?: string;
  isBot: boolean;
}

export interface AnalyticsData {
  totalClicks: number;
  clicksOverTime: { date: string; clicks: number }[];
  topCountries: { country: string; code: string; count: number; percentage: number }[];
  topCities: { city: string; country: string; count: number }[];
  topReferrers: { referrer: string; count: number; percentage: number }[];
  deviceBreakdown: { device: string; count: number; percentage: number }[];
  osBreakdown: { os: string; count: number; percentage: number }[];
  browserBreakdown: { browser: string; count: number; percentage: number }[];
  link?: {
    id: string;
    title: string;
    originalUrl: string;
    shortCode: string;
    customAlias?: string | null;
    clickCount: number;
    createdAt: string;
  };
  totalLinks?: number;
  activeLinks?: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}
