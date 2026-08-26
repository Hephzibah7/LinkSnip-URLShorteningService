import app from './app.js';
import { config } from './config/env.js';
import prisma from './config/prisma.js';
import { logger } from './utils/logger.js';

async function startServer() {
  try {
    // Attempt database connection check
    try {
      await prisma.$connect();
      logger.info('Database connection established successfully with PostgreSQL via Prisma');
    } catch (dbError: any) {
      logger.warn('Could not connect to database immediately. Verify DATABASE_URL in .env:', dbError.message);
    }

    const server = app.listen(config.port, () => {
      logger.info(`LinkSnip API Server running on port ${config.port}`);
      logger.info(`API Base URL: ${config.baseUrl}/api/v1`);
      logger.info(`Swagger API Documentation: ${config.baseUrl}/api-docs`);
      logger.info(`Frontend URL: ${config.frontendUrl}`);
    });

    const shutdown = async () => {
      logger.info('Received shutdown signal, closing server gracefully...');
      server.close(async () => {
        await prisma.$disconnect();
        logger.info('Prisma disconnected, server exited.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
