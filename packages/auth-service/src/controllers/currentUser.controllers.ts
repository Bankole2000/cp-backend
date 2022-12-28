import { ServiceResponse, signJWT } from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';

const { redisConfig } = config;
const userService = new UserDBService();

export const currentUserHandler = async (req: Request, res: Response) => {
  // #region STEP: Get User Details
  if (!req.user) {
    const sr = new ServiceResponse('No user logged In', null, false, 404, 'Not logged in', 'AUTH_SERVICE_USER_NOT_LOGGED_IN', 'You need to be logged in to get current user details');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  delete req.user.iat;
  delete req.user.exp;
  const accessToken = (await signJWT(req.user, config.self.jwtSecret as string, { expiresIn: config.self.accessTokenTTL })).token;
  const sr = new ServiceResponse(`Currently logged in as @${req.user.username}`, { user: req.user, accessToken: res.locals.newAccessToken || accessToken }, true, 200, null, null, null, res.locals.newAccessToken);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};

export const deleteOwnAccountHandler = async (req: Request, res: Response) => {
  const { userId } = req.user;
  const sr = await userService.softDeleteUserAccount(userId);
  await userService.invalidateAllActiveUserSessions(req.redis, redisConfig.scope as string, userId);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
