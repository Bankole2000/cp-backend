import { Router } from 'express';
import { getOwnPostsHandler } from '../controllers/currentuser.controllers';

const router = Router();

router.get('/posts', getOwnPostsHandler);

export { router as currentUserRoutes };
