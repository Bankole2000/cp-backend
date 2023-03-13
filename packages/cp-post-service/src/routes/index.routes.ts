import { Express } from 'express';
import {
  ExpressAdapter,
  createBullBoard,
  BullAdapter,
  BullMQAdapter
} from '@bull-board/express';
import { contentModerationRoles } from '@cribplug/common';
import { moderationQueue, publishingQueue } from '../services/queue/moderationQueue';
// import { currentUserRoutes } from './currentuser.routes';
import { dataRoutes } from './data.routes';
import { testRoutes } from './test.routes';
import { notFoundHandler } from '../middleware/errorHandler';
import { config } from '../utils/config';
import { postRoutes } from './post.routes';
import { adminRoutes } from './admin.routes';
import { moderationRoutes } from './moderation.routes';
import { requireLoggedInUser, requireRole } from '../middleware/requireUser';
import { currentUserRoutes } from './currentuser.routes';
import { userRoutes } from './user.routes';
import { tagRoutes } from './tag.routes';

const { basePath } = config.self;
const bullAdminPath = `${basePath}/bull/${config.self.serviceName}/admin/queues`;
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(bullAdminPath);

createBullBoard({
  queues: [new BullAdapter(moderationQueue), new BullAdapter(publishingQueue)],
  serverAdapter
});

export default (app: Express): void => {
  app.use(bullAdminPath, serverAdapter.getRouter());
  app.use(`${basePath}/me`, requireLoggedInUser, currentUserRoutes);
  app.use(`${basePath}/u`, userRoutes);
  app.use(`${basePath}/tags`, tagRoutes);
  app.use(`${basePath}/test`, testRoutes);
  app.use(`${basePath}/admin`, adminRoutes);
  app.use(`${basePath}/posts`, postRoutes);
  app.use(`${basePath}/moderation`, requireLoggedInUser, requireRole(contentModerationRoles), moderationRoutes);
  // app.use(`${basePath}/currentuser`, currentUserRoutes);
  app.use(`${basePath}/data`, dataRoutes);

  app.use('*', notFoundHandler);
};
