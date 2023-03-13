import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import TagDBService from '../services/tag.service';

const ts = new TagDBService();

export const getTagsHandler = async (req: Request, res: Response) => {
  const { q: searchTerm } = req.query;
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
  let sr: ServiceResponse;
  if (searchTerm) {
    sr = await ts.searchTags(searchTerm as string, page, limit);
  } else {
    sr = await ts.getTags(page, limit);
  }
  return res.status(sr.statusCode).send(sr);
};

export const getTagPostsHandler = async (req: Request, res: Response) => {
  const { tag } = req.params;
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
  const sr = await ts.getTagPosts(tag, page, limit, req.user.userId);
  return res.status(sr.statusCode).send(sr);
};
