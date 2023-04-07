import { Router } from 'express';
import {
  createCommentWithMediaIntentHandler,
  createCommentWithoutMediaHandler,
  deleteCommentHandler,
  getCommentLikesHandler,
  getCommentRepliesHandler,
  getPostCommentsHandler,
  likeCommentHandler,
  pinCommentHandler,
  unpinCommentHandler,
  replyToCommentHandler,
  unlikeCommentHandler,
} from '../controllers/comments.controllers';
import { requireLoggedInUser } from '../middleware/requireUser';
import { checkCommentExistsOnPost } from '../middleware/userOwnsResource';
import { validate } from '../middleware/validateRequest';
import { createCommentSchema } from '../schema/post.schema';

const router = Router({ mergeParams: true });

router.get('/', getPostCommentsHandler);
router.post('/', requireLoggedInUser, validate(createCommentSchema, 'Comment'), createCommentWithoutMediaHandler);
router.post('/create', requireLoggedInUser, createCommentWithMediaIntentHandler);
router.delete('/:commentId', requireLoggedInUser, checkCommentExistsOnPost, deleteCommentHandler);
router.get('/:commentId/likes', requireLoggedInUser, checkCommentExistsOnPost, getCommentLikesHandler);
router.post('/:commentId/likes', requireLoggedInUser, checkCommentExistsOnPost, likeCommentHandler);
router.delete('/:commentId/likes', requireLoggedInUser, checkCommentExistsOnPost, unlikeCommentHandler);
router.post('/:commentId/pin', requireLoggedInUser, pinCommentHandler);
router.delete('/:commentId/pin', requireLoggedInUser, unpinCommentHandler);
router.get('/:commentId/replies', requireLoggedInUser, checkCommentExistsOnPost, getCommentRepliesHandler);
router.post('/:commentId/replies', requireLoggedInUser, validate(createCommentSchema, 'Comment Reply'), createCommentWithoutMediaHandler);

export { router as commentRoutes };
