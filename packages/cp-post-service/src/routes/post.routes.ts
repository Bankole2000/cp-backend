import { Router } from 'express';
import { pinCommentHanlder } from '../controllers/comments.controllers';
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
import { commentRoutes } from './comment.routes';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/create', requireLoggedInUser, createPostIntentHandler);
router.post('/:postId/media', requireLoggedInUser, checkUserAuthoredPost, addPostMediaHandler);
router.patch('/:postId/media', requireLoggedInUser, checkUserAuthoredPost, updatePostMediaHandler);
router.delete('/:postId/media/:mediaId', requireLoggedInUser, checkUserAuthoredPost, removePostMediaHandler);
router.patch('/:postId/privacy', requireLoggedInUser, checkUserAuthoredPost, setPostPrivacyHandler);
router.patch('/:postId/caption', requireLoggedInUser, checkUserAuthoredPost, setPostCaptionHandler);
router.get('/:postId/publish', requireLoggedInUser, checkUserAuthoredPost, publishPostHandler);
router.get('/:postId/unpublish', requireLoggedInUser, checkUserAuthoredPost, unpublishPostHandler);
router.post('/:postId/likes', requireLoggedInUser, likePostHandler);
router.get('/:postId/likes', requireLoggedInUser, getPostLikesHandler);
router.patch('/:postId/comments/:commentId/pin', requireLoggedInUser, checkUserAuthoredPost, pinCommentHanlder);
router.use('/:postId/comments', commentRoutes);
router.delete('/:postId', requireLoggedInUser, checkUserAuthoredPost, deletePostHandler);

export { router as postRoutes };
