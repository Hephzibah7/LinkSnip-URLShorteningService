import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): any => {
  logger.error('Unhandled error in request:', {
    path: req.path,
    method: req.method,
    error: err.message || err,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal server error';

  return sendError(res, message, statusCode, process.env.NODE_ENV === 'development' ? err.stack : undefined);
};

export const notFoundHandler = (req: Request, res: Response): any => {
  return sendError(res, `Endpoint ${req.method} ${req.originalUrl} not found`, 404);
};
