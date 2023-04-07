import { ServiceResponse } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import UserDBService from '../services/user.service';

const userService = new UserDBService();

export const canFollow = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params;
  const userExists = await userService.findUserByUsername(username);
  if (!userExists.success) {
    return res.status(userExists.statusCode).send(userExists);
  }
  if (userExists.data.userId === req.user.userId) {
    const sr = new ServiceResponse('Can\'t perform this action on your own account', null, false, 400, 'Error performing action', 'PROFILE_SERVICE_ERROR_ACTION_NOT_ALLOWED_ON_SELF', 'Check username in request parameters');
    return res.status(sr.statusCode).send(sr);
  }
  const blocked = await userService.checkUserBlocked(userExists.data.userId, req.user.userId);
  if (blocked.success) {
    blocked.message = 'You have been blocked by this user';
    return res.status(blocked.statusCode).send(blocked);
  }
  return next();
};

export const profileIsNotSelf = async (req: Request, res: Response, next: NextFunction) => {
  const { username } = req.params;
  const userExists = await userService.findUserByUsername(username);
  if (!userExists.success) {
    return res.status(userExists.statusCode).send(userExists);
  }
  if (userExists.data.userId === req.user.userId) {
    const sr = new ServiceResponse('Can\'t perform this action on your own account', null, false, 400, 'Error performing action', 'PROFILE_SERVICE_ERROR_ACTION_NOT_ALLOWED_ON_SELF', 'Check username in request parameters');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
