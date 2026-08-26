import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from './config/env.js';
import apiRouter from './routes/index.js';
import redirectRoutes from './routes/redirect.routes.js';
import { globalLimiter } from './middlewares/rate-limiter.middleware.js';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// Trust proxy for accurate client IP detection behind proxies/load balancers
app.set('trust proxy', 1);

// Standard CORS configuration
app.use(
  cors({
    origin: true, // Allow frontend access
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'LinkSnip URL Shortener API',
  });
});

// Swagger UI Interactive API Documentation
try {
  const swaggerDocument = JSON.parse(readFileSync(join(__dirname, 'docs', 'swagger.json'), 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  app.get('/openapi.json', (req, res) => res.json(swaggerDocument));
} catch (err) {
  console.warn('Could not load swagger.json for /api-docs:', err);
}

// Global API rate limiting
app.use('/api', globalLimiter);

// API v1 routes
app.use('/api/v1', apiRouter);

// Root redirect & unlock routes (e.g. GET /:slug)
app.use('/', redirectRoutes);

// Error and Not Found Handlers
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
