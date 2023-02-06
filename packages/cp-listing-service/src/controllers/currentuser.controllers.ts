import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import CurrentUserDBService from '../services/currentuser.service';

const cuService = new CurrentUserDBService();

export const getCurrentUserPublishedListings = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 20;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await cuService.getUserPublishedListings(req.user.userId, page, limit);
  return res.status(sr.statusCode).send(sr);
};

export const getCurrentUserAllListings = async (req: Request, res: Response) => {
  const sr = await cuService.getAllUserListings(req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const getCurrentUserSavedListings = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not Yet Implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};
