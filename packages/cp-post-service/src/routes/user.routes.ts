import { Router } from 'express';
import { getUserPostsHandler } from '../controllers/user.controllers';
import { checkUserBlocked } from '../middleware/userOwnsResource';

const router = Router();

router.get('/:username/posts', checkUserBlocked, getUserPostsHandler);

export { router as userRoutes };
