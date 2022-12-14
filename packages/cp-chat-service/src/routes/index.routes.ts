import { Express } from 'express';
// import { currentUserRoutes } from './currentuser.routes';
import { dataRoutes } from './data.routes';
// import { loginRoutes } from './login.routes';
// import { registerRoutes } from './register.routes';
import { testRoutes } from './test.routes';
import { notFoundHandler } from '../middleware/errorHandler';
import { config } from '../utils/config';

const { basePath } = config.self;

export default (app: Express): void => {
  app.use(`${basePath}/test`, testRoutes);
  // app.use(`${basePath}/register`, registerRoutes);
  // app.use(`${basePath}/login`, loginRoutes);
  // app.use(`${basePath}/currentuser`, currentUserRoutes);
  // app.use(`${basePath}/logout`, testRoutes);
  app.use(`${basePath}/data`, dataRoutes);

  app.use('*', notFoundHandler);
};
