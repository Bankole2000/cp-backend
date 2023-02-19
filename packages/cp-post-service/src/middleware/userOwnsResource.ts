import { ServiceResponse } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import PostDBService from '../services/post.service';

const ps = new PostDBService();

export const checkUserAuthoredPost = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;
  const { postId } = req.params;
  const postExists = await ps.getPostById(postId);
  if (!postExists.success) {
    return res.status(postExists.statusCode).send(postExists);
  }
  if (postExists.data.createdBy !== user.userId) {
    const sr = new ServiceResponse('You do not have permission to perform this action', null, false, 403, 'Forbidden', 'POST_SERVICE_USER_NOT_AUTHORIZED', 'You do not have permission to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
