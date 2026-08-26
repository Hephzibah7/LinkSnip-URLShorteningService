import { Router } from 'express';
import authRoutes from './auth.routes.js';
import linkRoutes from './link.routes.js';
import analyticsRoutes from './analytics.routes.js';
import tagFolderRoutes from './tag-folder.routes.js';

const apiRouter = Router();

apiRouter.use('/auth', authRoutes);
apiRouter.use('/links', linkRoutes);
apiRouter.use('/analytics', analyticsRoutes);
apiRouter.use('/', tagFolderRoutes);

export default apiRouter;
