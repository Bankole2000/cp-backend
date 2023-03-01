import { Router } from 'express';
import { pinCommentHanlder } from '../controllers/comments.controllers';
import {
  addPostMediaHandler,
  changePostMediaOrderHandler,
  createPostIntentHandler,
  deletePostHandler,
  getPostDetailsHandler,
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
import upload from '../middleware/multerUpload';
import { requireLoggedInUser } from '../middleware/requireUser';
import { checkPostHasMedia, checkUserAuthoredPost } from '../middleware/userOwnsResource';
import { commentRoutes } from './comment.routes';

const router = Router();

// TODO: Post Limit middleware: 5 posts daily for normal users
// TODO: PostMedia Limit middleware: 5 media per post for normal users
// TODO: Published posts should not be editable
// TODO: Posts should have url limits ??
// TODO: Posts should have hashtag limits ??

router.get('/', testEndpointHandler);
router.get('/create', requireLoggedInUser, createPostIntentHandler);
router.get('/:postId', getPostDetailsHandler);
router.post('/:postId/media', requireLoggedInUser, checkUserAuthoredPost, upload.single('media'), addPostMediaHandler);
router.patch('/:postId/media/:mediaId', requireLoggedInUser, checkUserAuthoredPost, checkPostHasMedia, updatePostMediaHandler);
router.patch('/:postId/media/:mediaId/order', requireLoggedInUser, checkUserAuthoredPost, checkPostHasMedia, changePostMediaOrderHandler);
router.delete('/:postId/media/:mediaId', requireLoggedInUser, checkUserAuthoredPost, checkPostHasMedia, removePostMediaHandler);
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
