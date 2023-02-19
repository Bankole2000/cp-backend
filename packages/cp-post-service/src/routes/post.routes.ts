import { Router } from 'express';
import {
  addPostMediaHandler,
  createPostIntentHandler,
  deletePostHandler,
  getPostLikesHandler,
  likePostHandler,
  publishPostHandler,
  removePostMediaHandler,
  setPostCaptionHandler,
  setPostPrivacyHandler,
  unpublishPostHandler,
  updatePostMediaHandler
} from '../controllers/post.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import { requireLoggedInUser } from '../middleware/requireUser';
import { checkUserAuthoredPost } from '../middleware/userOwnsResource';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/create', requireLoggedInUser, createPostIntentHandler);
router.post('/:postId/media', requireLoggedInUser, checkUserAuthoredPost, addPostMediaHandler);
router.patch('/:postId/media', requireLoggedInUser, checkUserAuthoredPost, updatePostMediaHandler);
router.delete('/:postId/media/:mediaId', requireLoggedInUser, checkUserAuthoredPost, removePostMediaHandler);
router.patch('/:postId/privacy', requireLoggedInUser, checkUserAuthoredPost, setPostPrivacyHandler);
router.patch('/:postId/caption', requireLoggedInUser, checkUserAuthoredPost, setPostCaptionHandler);
router.post('/:postId/publish', requireLoggedInUser, checkUserAuthoredPost, publishPostHandler);
router.post('/:postId/unpublish', requireLoggedInUser, checkUserAuthoredPost, unpublishPostHandler);
router.post('/:postId/likes', requireLoggedInUser, likePostHandler);
router.get('/:postId/likes', requireLoggedInUser, getPostLikesHandler);
router.delete('/:postId', requireLoggedInUser, checkUserAuthoredPost, deletePostHandler);

export { router as postRoutes };
