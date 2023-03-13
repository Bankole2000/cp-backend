import { Router } from 'express';
import { getTagPostsHandler, getTagsHandler } from '../controllers/tag.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', getTagsHandler);
router.get('/search', testEndpointHandler);
router.get('/:tag/posts', getTagPostsHandler);

export { router as tagRoutes };
