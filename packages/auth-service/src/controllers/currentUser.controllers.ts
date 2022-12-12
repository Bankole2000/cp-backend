import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import UserDBService from '../services/user.service';

const userService = new UserDBService();

export const currentUserHandler = async (req: Request, res: Response) => {
  // #region STEP: Get User Details
  if (!req.user) {
    const sr = new ServiceResponse('No user logged In', null, false, 404, 'Not logged in', 'AUTH_SERVICE_USER_NOT_LOGGED_IN', 'You need to be logged in to get current user details');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse(`Currently logged in as @${req.user.username}`, req.user, true, 200, null, null, null, res.locals.newAccessToken);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};

export const deleteOwnAccountHandler = async (req: Request, res: Response) => {
  const { userId } = req.user;
  const sr = await userService.softDeleteUserAccount(userId);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
