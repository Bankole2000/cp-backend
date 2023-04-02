import { Request, Response } from 'express';
import UserDBService from '../services/user.service';

const us = new UserDBService();

export const getOwnPostsHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
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
  const sr = await us.getUserPublishedPosts(req.user.userId, page, limit, req.user.userId);
  sr.data.unpublished = await us.countUnpublishedPosts(req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const getAllUserPostsHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
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
  const sr = await us.getAllUserPosts(req.user.userId);
  return res.status(sr.statusCode).send(sr);
};
