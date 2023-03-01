import { ServiceResponse } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import PostDBService from '../services/post.service';

const ps = new PostDBService();

export const checkUserAuthoredPost = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;
  const { postId } = req.params;
  console.log({ postId, params: req.params });
  const postExists = await ps.getPostById(postId);
  if (!postExists.success) {
    return res.status(postExists.statusCode).send(postExists);
  }
  if (postExists.data.createdBy !== user.userId) {
    const sr = new ServiceResponse('You do not have permission to perform this action', null, false, 403, 'Forbidden', 'POST_SERVICE_USER_NOT_AUTHORIZED', 'You do not have permission to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  if (postExists.data.published && !req.url.includes('unpublish')) {
    const sr = new ServiceResponse('Can\'t edit a post that has been published', null, false, 400, 'Forbidden', 'POST_SERVICE_POST_ALREADY_PUBLISHED', 'Unpublish the post if you wish to edit it');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const checkPostHasMedia = async (req: Request, res: Response, next: NextFunction) => {
  const { postId, mediaId } = req.params;
  const pm = await ps.getMediaById(mediaId);
  if (!pm.success) {
    return res.status(pm.statusCode).send(pm);
  }
  if (pm.data.post !== postId) {
    const sr = new ServiceResponse('This media is not for this post', null, false, 400, 'Media ID Post ID mismatch', 'POST_SERVICE_MEDIA_POST_MISMATCH', 'Check media Id and post Id');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
