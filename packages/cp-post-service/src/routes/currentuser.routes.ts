import { Router } from 'express';
import { getAllUserPostsHandler, getOwnPostsHandler } from '../controllers/currentuser.controllers';

const router = Router();

router.get('/posts', getOwnPostsHandler);
router.get('/posts/all', getAllUserPostsHandler);

export { router as currentUserRoutes };
