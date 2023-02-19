import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import PBService from '../services/pb.service';
import PostDBService from '../services/post.service';
import { config } from '../utils/config';

const PS = new PostDBService();
const pb = new PBService(config.pocketbase.url || '');

export const createPostIntentHandler = async (req: Request, res: Response) => {
  const { user } = req;
  if (!user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'POST_SERVICE_USER_NOT_AUTHENTICATED', 'You must be logged in to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  await pb.saveAuth(user.pbToken, user.pbUser);
  const pbPost = await pb.createPost({ createdBy: user.userId });
  if (!pbPost.success) {
    await logResponse(req, pbPost);
    return res.status(pbPost.statusCode).send(pbPost);
  }
  delete pbPost.data.expand;
  delete pbPost.data.collectionId;
  delete pbPost.data.collectionName;
  const postData = {
    ...pbPost.data,
    created: new Date(pbPost.data.created),
    updated: new Date(pbPost.data.updated),
  };
  const sr = await PS.createPostIntent(postData);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const addPostMediaHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const updatePostMediaHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const removePostMediaHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const updatePostDetailsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const deletePostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const likePostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const getPostLikesHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const getUserPublicPostsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const setPostCaptionHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const setPostPrivacyHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const publishPostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const unpublishPostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};
