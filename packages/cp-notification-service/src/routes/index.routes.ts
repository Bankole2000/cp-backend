import { Express } from 'express';
import {
  ExpressAdapter,
  createBullBoard,
  BullAdapter,
  BullMQAdapter
} from '@bull-board/express';
import { dataRoutes } from './data.routes';
import { testRoutes } from './test.routes';
import { notFoundHandler } from '../middleware/errorHandler';
import { config } from '../utils/config';
import { currentUserRoutes } from './currentuser.routes';
import { adminRoutes } from './admin.routes';
import { requireLoggedInUser } from '../middleware/requireUser';
import { notificationQueue } from '../services/queue/notificationQueue';

const { basePath } = config.self;
const bullAdminPath = `${basePath}/bull/${config.self.serviceName}/admin/queues`;
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(bullAdminPath);

createBullBoard({
  queues: [new BullAdapter(notificationQueue)],
  serverAdapter,
});

export default (app: Express): void => {
  app.use(bullAdminPath, serverAdapter.getRouter());
  app.use(`${basePath}/admin`, adminRoutes);
  app.use(`${basePath}/me`, requireLoggedInUser, currentUserRoutes);
  app.use(`${basePath}/test`, testRoutes);
  app.use(`${basePath}/data`, dataRoutes);

  app.use('*', notFoundHandler);
};
