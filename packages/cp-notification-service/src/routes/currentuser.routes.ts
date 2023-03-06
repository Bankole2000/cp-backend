import { Router } from 'express';
import { getUserNextNotificationsHandler, getUserPreviousNotificationsHandler } from '../controllers/currentuser.controllers';

const router = Router();

router.get('/notifications/previous', getUserPreviousNotificationsHandler);
router.get('/notifications/next', getUserNextNotificationsHandler);

export { router as currentUserRoutes };
