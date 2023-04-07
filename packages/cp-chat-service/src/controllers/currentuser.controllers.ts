import { Request, Response } from 'express';
// import { PrismaClient } from '@prisma/client';
import { ServiceResponse } from '@cribplug/common';
// import { config } from '../utils/config';
import ChatDBService from '../services/chat.service';
import UserDBService from '../services/user.service';

const chatService = new ChatDBService();
const userService = new UserDBService();

export const getUserContactsHandler = async (req: Request, res: Response) => {
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
  const sr = await chatService.getUserContacts(req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const searchUserContactsHandler = async (req: Request, res: Response) => {
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
  const sr = await chatService.searchUserContacts(
    req.user.userId,
    searchTerm as string,
    page,
    limit
  );
  return res.status(sr.statusCode).send(sr);
};

export const addUserContactHandler = async (req: Request, res: Response) => {
  const { username } = req.body;
  const uExists = await userService.findUserByUsername(username);
  if (!uExists.success) {
    return res.status(uExists.statusCode).send(uExists);
  }
  const sr = await chatService.createPrivateContact(uExists.data.userId, req.user.userId);
  return res.status(sr.statusCode).send(sr);
};
