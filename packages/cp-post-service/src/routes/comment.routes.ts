import { Router } from 'express';
import {
  createCommentWithMediaIntentHandler,
  createCommentWithoutMediaHandler,
  deleteCommentHandler,
  getCommentLikesHandler,
  getCommentRepliesHandler,
  getPostCommentsHandler,
  likeCommentHandler,
  replyToCommentHandler
} from '../controllers/comments.controllers';
import { requireLoggedInUser } from '../middleware/requireUser';
import { validate } from '../middleware/validateRequest';
import { createCommentSchema } from '../schema/post.schema';

const router = Router({ mergeParams: true });

router.get('/', getPostCommentsHandler);
router.post('/', requireLoggedInUser, validate(createCommentSchema, 'Comment'), createCommentWithoutMediaHandler);
router.post('/create', requireLoggedInUser, createCommentWithMediaIntentHandler);
router.delete('/:commentId', requireLoggedInUser, deleteCommentHandler);
router.get('/:commentId/likes', requireLoggedInUser, getCommentLikesHandler);
router.post('/:commentId/likes', requireLoggedInUser, likeCommentHandler);
router.get('/:commentId/replies', requireLoggedInUser, getCommentRepliesHandler);
router.post('/:commentId/replies', requireLoggedInUser, validate(createCommentSchema, 'Comment Reply'), createCommentWithoutMediaHandler);

export { router as commentRoutes };
