import { getIO, ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import fs, { PathLike } from 'fs';
import { config } from '../utils/config';
import CommentDBService from '../services/comment.service';
import PBService from '../services/pb.service';
import { addCommentToPublishingQueue } from '../services/queue/moderationQueue';
import { socketEventTypes } from '../schema/socket.schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');

const cs = new CommentDBService();
const pb = new PBService(config.pocketbase.url || '');

const deleteUploadedFile = (filePath: PathLike) => {
  fs.unlinkSync(filePath);
};

export const createCommentOnPostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const createCommentWithMediaIntentHandler = async (req: Request, res: Response) => {
  const { user } = req;
  const { postId, commentId } = req.params;
  const { content } = req.body;
  const sr = await cs.createComment(postId, user.userId, content, commentId);
  return res.status(sr.statusCode).send(sr);
};

export const createCommentWithoutMediaHandler = async (req: Request, res: Response) => {
  const { user } = req;
  const { postId, commentId } = req.params;
  const { content } = req.body;
  // const io = getIO();
  if (!content.trim()) {
    const sr = new ServiceResponse('Comment without media must have a caption', null, false, 400, 'Error creating comment - no content', 'POST_SERVICE_ERROR_COMMENT_HAS_NO_CONTENT', 'Please add content to your comment');
    return res.status(sr.statusCode).send(sr);
  }
  const sr = await cs.createComment(postId, user.userId, content, commentId);
  if (sr.success) {
    // if (!commentId) {
    //   io.in(postId).emit(socketEventTypes.COMMENT_PUBLISHED, sr.data);
    // } else {
    //   io.in(postId).emit(socketEventTypes.COMMENT_REPLY_PUBLISHED, sr.data);
    // }
    addCommentToPublishingQueue(sr.data);
  }
  return res.status(sr.statusCode).send(sr);
};

// export const addCommentMediaHandler = async (req: Request, res: Response) => {
//   console.log({ body: req.body });
//   if (!req.body.type || !['IMAGE', 'GIF'].includes(req.body.type)) {
//     if (req.file) {
//       deleteUploadedFile(req.file?.path);
//     }
//     const sr = new ServiceResponse('Invalid Media Type', null, false, 400, 'Invalid Media Type', 'POST_SERVICE_ERROR_INVALID_MEDIA_TYPE', 'Media Type should be indicated in request body');
//     return res.status(sr.statusCode).send(sr);
//   }
//   await pb.saveAuth(req.user.pbToken, req.user.pbUser);
//   const form = new FormData();
//   if (req.file) {
//     form.append('image', fs.createReadStream(req.file?.path as PathLike));
//   }
//   form.append('type', req.body.type);
//   let imageUrl = req.body.imageUrl || '';
//   if (req.body.type === 'IMAGE') {
//     imageUrl = await pb.generateImageUrl(pbPM.data, pbPM.data.image);
//     deleteUploadedFile(req.file?.path as PathLike);
//   } else if (req.body.type === 'GIF') {
//     imageUrl = req.body.data.url;
//   }
// };

export const getPostCommentsHandler = async (req: Request, res: Response) => {
  console.log({ params: req.params });
  let limit: number;
  let page: number;
  let sort: string;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  if (req.query.sort !== 'top') {
    sort = 'latest';
  } else {
    sort = 'top';
  }
  const sr = await cs.getPostComments(req.params.postId, sort, page, limit, req.user?.userId);
  return res.status(sr.statusCode).send(sr);
};

export const deleteCommentHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const getCommentLikesHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const likeCommentHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const pinCommentHanlder = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const replyToCommentHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const getCommentRepliesHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};
