import { Express } from 'express';
// import { currentUserRoutes } from './currentuser.routes';
import { dataRoutes } from './data.routes';
import { testRoutes } from './test.routes';
import { notFoundHandler } from '../middleware/errorHandler';
import { config } from '../utils/config';
import { amenityRoutes } from './amenities.routes';
import { listingRoutes } from './listing.routes';
import { settingsRoutes } from './settings.routes';
import { requireLoggedInUser, requireRole } from '../middleware/requireUser';
import { currentUserRoutes } from './currentUser.routes';
import { adminRoutes } from './admin.routes';
import { userRoutes } from './user.routes';

const { basePath } = config.self;

export default (app: Express): void => {
  app.use(`${basePath}/test`, testRoutes);
  app.use(`${basePath}/listings`, listingRoutes);
  app.use(`${basePath}/settings`, settingsRoutes);
  app.use(`${basePath}/amenity`, amenityRoutes);
  app.use(`${basePath}/houserules`, testRoutes);
  app.use(`${basePath}/currencies`, testRoutes);
  app.use(`${basePath}/locations`, testRoutes);
  app.use(`${basePath}/currentuser`, requireLoggedInUser, currentUserRoutes);
  app.use(`${basePath}/user`, userRoutes);
  app.use(`${basePath}/admin`, requireLoggedInUser, requireRole(['ADMIN']), adminRoutes);
  app.use(`${basePath}/data`, dataRoutes);

  app.use('*', notFoundHandler);
};
