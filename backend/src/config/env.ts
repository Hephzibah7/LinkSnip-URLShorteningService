import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  databaseUrl: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5000/linksnip?schema=public',
  jwtSecret: process.env.JWT_SECRET || 'linksnip-jwt-secret-token-key-super-secure-2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  baseUrl: process.env.BASE_URL || 'http://localhost:4000',
  safeBrowsingApiKey: process.env.SAFE_BROWSING_API_KEY || '',
  rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
  rateLimitMaxRequests: 100, // 100 requests per 15 minutes
};
