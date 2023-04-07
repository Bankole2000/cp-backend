import { Request, Response } from 'express';
import UserDBService from '../services/user.service';

const us = new UserDBService();

export const getUserPostsHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: user } = await us.findUserByUsername(username);
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
  const sr = await us.getUserPublishedPosts(
    user.userId,
    page,
    limit,
    req.user?.userId
  );
  return res.status(sr.statusCode).send(sr);
};
