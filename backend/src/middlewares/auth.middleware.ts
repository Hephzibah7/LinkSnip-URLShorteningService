import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { userRepository } from '../repositories/user.repository.js';
import { sendError } from '../utils/response.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  isEmailVerified: boolean;
  apiKey?: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Middleware that requires a valid JWT Bearer token or x-api-key header
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'] as string;

    // Check API Key authentication
    if (apiKeyHeader) {
      const user = await userRepository.findByApiKey(apiKeyHeader);
      if (!user) {
        return sendError(res, 'Invalid API Key', 401);
      }
      req.user = {
        id: user.id,
        email: user.email,
        name: user.name,
        isEmailVerified: user.isEmailVerified,
        apiKey: user.apiKey,
      };
      return next();
    }

    // Check JWT Bearer token authentication
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, 'Authentication required. Please provide a valid token.', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; name: string };

    const user = await userRepository.findById(decoded.userId);
    if (!user) {
      return sendError(res, 'User account no longer exists', 401);
    }

    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      isEmailVerified: user.isEmailVerified,
      apiKey: user.apiKey,
    };

    return next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      return sendError(res, 'Session expired. Please log in again.', 401);
    }
    return sendError(res, 'Invalid authentication token', 401);
  }
};

/**
 * Middleware that extracts user if token exists, but doesn't block guests
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<any> => {
  try {
    const authHeader = req.headers.authorization;
    const apiKeyHeader = req.headers['x-api-key'] as string;

    if (apiKeyHeader) {
      const user = await userRepository.findByApiKey(apiKeyHeader);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
          apiKey: user.apiKey,
        };
      }
      return next();
    }

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, config.jwtSecret) as { userId: string; email: string; name: string };
      const user = await userRepository.findById(decoded.userId);
      if (user) {
        req.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          isEmailVerified: user.isEmailVerified,
          apiKey: user.apiKey,
        };
      }
    }
  } catch {
    // Optional auth silently ignores errors
  }
  return next();
};
