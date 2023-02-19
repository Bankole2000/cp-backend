import { Router } from 'express';
import {
  createCommentOnPostHandler,
  deleteCommentHandler,
  getCommentLikesHandler,
  getCommentRepliesHandler,
  getPostCommentsHandler,
  likeCommentHandler,
  replyToCommentHandler
} from '../controllers/comments.controllers';
import { requireLoggedInUser } from '../middleware/requireUser';

const router = Router();

router.get('/', getPostCommentsHandler);
router.post('/', requireLoggedInUser, createCommentOnPostHandler);
router.delete('/:commentId', deleteCommentHandler);
router.get('/:commentId/likes', getCommentLikesHandler);
router.post('/:commentId/likes', requireLoggedInUser, likeCommentHandler);
router.get('/:commentId/replies', getCommentRepliesHandler);
router.post('/:commentId/replies', requireLoggedInUser, replyToCommentHandler);

export { router as commentRoutes };
