import { Express } from 'express';
// import { currentUserRoutes } from './currentuser.routes';
import { dataRoutes } from './data.routes';
import { testRoutes } from './test.routes';
import { notFoundHandler } from '../middleware/errorHandler';
import { config } from '../utils/config';
import { currentUserRoutes } from './currentuser.routes';
import { userProfileRoutes } from './userProfile.routes';
import { requireLoggedInUser, requireRole } from '../middleware/requireUser';
import { adminRoutes } from './admin.routes';
import { profileRoutes } from './profile.routes';

const { basePath } = config.self;

export default (app: Express): void => {
  app.use(`${basePath}/test`, testRoutes);
  app.use(`${basePath}/admin`, requireLoggedInUser, requireRole(['ADMIN', 'SUPER_ADMIN']), adminRoutes);
  app.use(`${basePath}/me`, requireLoggedInUser, currentUserRoutes);
  app.use(`${basePath}/u`, userProfileRoutes);
  app.use(`${basePath}/p`, profileRoutes);
  // app.use(`${basePath}/currentuser`, currentUserRoutes);
  app.use(`${basePath}/data`, dataRoutes);

  app.use('*', notFoundHandler);
};
