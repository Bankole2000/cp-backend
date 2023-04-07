import { Router } from 'express';
import { addModerationReviewHandler, cancelAutoModerationHandler, getPostsInModerationQueueHandler } from '../controllers/moderation.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/posts', getPostsInModerationQueueHandler);
router.delete('/post/:postId/automoderation', cancelAutoModerationHandler);
router.post('/post/:postId/automoderation');
router.post('/post/:postId/review', addModerationReviewHandler);

export { router as moderationRoutes };
