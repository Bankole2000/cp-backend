import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import ProfileDBService from '../services/profile.service';
import UserDBService from '../services/user.service';

const ps = new ProfileDBService();
const us = new UserDBService();

export const getUserFollowershandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const uExists = await us.findUserByUsername(username);
  if (!uExists.success) {
    return res.status(uExists.statusCode).send(uExists);
  }
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
  const sr = await ps.getUserFollowers(uExists.data.userId, page, limit, req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const searchUserFollowersHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { q: searchTerm } = req.query;
  if (!searchTerm) {
    const serviceResponse = new ServiceResponse(
      'Search term is required',
      null,
      false,
      400,
      'Search term is required',
      'Search term is required',
      'Add search term to request query params'
    );
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  }
  const uExists = await us.findUserByUsername(username);
  if (!uExists.success) {
    return res.status(uExists.statusCode).send(uExists);
  }
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
  const sr = await ps.searchUserFollowers(
    uExists.data.userId,
    searchTerm as string,
    page,
    limit,
    req.user.userId
  );
  return res.status(sr.statusCode).send(sr);
};

export const getUserFollowingHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const uExists = await us.findUserByUsername(username);
  if (!uExists.success) {
    return res.status(uExists.statusCode).send(uExists);
  }
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
  const sr = await ps.getUserFollowing(uExists.data.userId, page, limit, req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const searchUserFollowingHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { q: searchTerm } = req.query;
  if (!searchTerm) {
    const serviceResponse = new ServiceResponse(
      'Search term is required',
      null,
      false,
      400,
      'Search term is required',
      'Search term is required',
      'Add search term to request query params'
    );
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  }
  const uExists = await us.findUserByUsername(username);
  if (!uExists.success) {
    return res.status(uExists.statusCode).send(uExists);
  }
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
  const sr = await ps.searchUserFollowing(
    uExists.data.userId,
    searchTerm as string,
    page,
    limit,
    req.user.userId
  );
  return res.status(sr.statusCode).send(sr);
};
