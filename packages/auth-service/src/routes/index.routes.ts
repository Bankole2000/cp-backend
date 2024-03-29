import { Express } from 'express';
import { currentUserRoutes } from './currentuser.routes';
import { dataRoutes } from './data.routes';
import { loginRoutes } from './login.routes';
import { registerRoutes } from './register.routes';
import { testRoutes } from './test.routes';
import { notFoundHandler } from '../middleware/errorHandler';
import { config } from '../utils/config';
import { requireLoggedInUser } from '../middleware/requireUser';
import { logoutHandler } from '../controllers/login.controllers';
import { systemRoutes } from './system.routes';
import { verifyRoutes } from './verify.routes';
import { adminRoutes } from './admin.routes';

const { basePath } = config.self;

export default (app: Express): void => {
  app.get(`${basePath}/logout`, requireLoggedInUser, logoutHandler);
  app.use(`${basePath}/test`, testRoutes);
  app.use(`${basePath}/register`, registerRoutes);
  app.use(`${basePath}/login`, loginRoutes);
  app.use(`${basePath}/verify`, verifyRoutes);
  app.use(`${basePath}/currentuser`, requireLoggedInUser, currentUserRoutes);
  app.use(`${basePath}/data`, dataRoutes);
  app.use(`${basePath}/system`, systemRoutes);
  app.use(`${basePath}/admin`, adminRoutes);

  app.use('*', notFoundHandler);
};
