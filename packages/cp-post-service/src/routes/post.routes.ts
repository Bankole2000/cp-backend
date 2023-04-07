import { Router } from 'express';
import { pinCommentHandler } from '../controllers/comments.controllers';
import {
  addPostMediaHandler,
  changePostMediaOrderHandler,
  createPostIntentHandler,
  createRepostHandler,
  deletePublishedPostHandler,
  getPostDetailsHandler,
  getPostLikesHandler,
  getQuotePostsHandler,
  likePostHandler,
  postPublishHandler,
  publishPostHandler,
  removePostMediaHandler,
  setPostCaptionHandler,
  setPostPrivacyHandler,
  unlikePostHandler,
  unpublishPostHandler,
  updatePostMediaHandler,
  getRepostedByHandler,
  undoRepostHandler,
  getLatestPublishedPostsHandler,
  pinPostHandler,
  unpinPostHandler,
  deleteUnpublishedPostHandler,
} from '../controllers/post.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import upload from '../middleware/multerUpload';
import { requireLoggedInUser } from '../middleware/requireUser';
import {
  checkPostExists,
  checkPostHasMedia,
  checkPostIsNotRetweet,
  checkUserAuthoredPost
} from '../middleware/userOwnsResource';
import { commentRoutes } from './comment.routes';

const router = Router();

// TODO: Post Limit middleware: 5 posts daily for normal users
// TODO: PostMedia Limit middleware: 5 media per post for normal users
// TODO: Published posts should not be editable
// TODO: Posts should have url limits ??
// TODO: Posts should have hashtag limits ??

router.get('/', getLatestPublishedPostsHandler);
router.get('/create', requireLoggedInUser, createPostIntentHandler);
router.get('/:postId', getPostDetailsHandler);
router.post('/:postId/pin', requireLoggedInUser, checkPostExists, pinPostHandler);
router.delete('/:postId/pin', requireLoggedInUser, checkPostExists, unpinPostHandler);
router.post('/:postId/media', requireLoggedInUser, checkUserAuthoredPost, upload.single('media'), addPostMediaHandler);
router.patch('/:postId/media/:mediaId', requireLoggedInUser, checkUserAuthoredPost, checkPostHasMedia, updatePostMediaHandler);
router.patch('/:postId/media/:mediaId/order', requireLoggedInUser, checkUserAuthoredPost, checkPostHasMedia, changePostMediaOrderHandler);
router.delete('/:postId/media/:mediaId', requireLoggedInUser, checkUserAuthoredPost, checkPostHasMedia, removePostMediaHandler);
router.patch('/:postId/privacy', requireLoggedInUser, checkUserAuthoredPost, setPostPrivacyHandler);
router.patch('/:postId/caption', requireLoggedInUser, checkUserAuthoredPost, setPostCaptionHandler);
router.get('/:postId/publish', requireLoggedInUser, checkUserAuthoredPost, publishPostHandler);
router.post('/:postId/publish', requireLoggedInUser, checkUserAuthoredPost, postPublishHandler);
router.get('/:postId/unpublish', requireLoggedInUser, checkUserAuthoredPost, unpublishPostHandler);
router.delete('/:postId/unpublished', requireLoggedInUser, checkUserAuthoredPost, deleteUnpublishedPostHandler);
router.post('/:postId/likes', requireLoggedInUser, checkPostExists, likePostHandler);
router.delete('/:postId/likes', requireLoggedInUser, checkPostExists, unlikePostHandler);
router.get('/:postId/likes', checkPostExists, getPostLikesHandler);
router.post('/:postId/reposts', requireLoggedInUser, checkPostExists, createRepostHandler);
router.get('/:postId/reposts', checkPostExists, getQuotePostsHandler);
router.delete('/:postId/reposts', requireLoggedInUser, checkPostExists, undoRepostHandler); // Undo repost handler
router.get('/:postId/reposted-by', checkPostExists, getRepostedByHandler);
router.use('/:postId/comments', checkPostIsNotRetweet, commentRoutes);
router.delete('/:postId', requireLoggedInUser, checkUserAuthoredPost, deletePublishedPostHandler);

export { router as postRoutes };
