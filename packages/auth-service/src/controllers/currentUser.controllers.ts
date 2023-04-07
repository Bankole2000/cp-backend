import { ServiceResponse, signJWT } from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import UserDBService from '../services/user.service';
import PBService from '../services/pb.service';
import { config } from '../utils/config';

const { redisConfig, pocketbase: { url } } = config;
const userService = new UserDBService();
const pb = new PBService(url as string);
export const currentUserHandler = async (req: Request, res: Response) => {
  // #region STEP: Get User Details
  if (!req.user) {
    const sr = new ServiceResponse('No user logged In', null, false, 404, 'Not logged in', 'AUTH_SERVICE_USER_NOT_LOGGED_IN', 'You need to be logged in to get current user details');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  await pb.checkAuth();
  delete req.user.iat;
  delete req.user.exp;
  const accessToken = (await signJWT(
    req.user,
    config.self.jwtSecret as string,
    { expiresIn: config.self.accessTokenTTL }
  )).token;
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

export const getUserDevicesHandler = async (req: Request, res: Response) => {
  const sr = await userService.getUserDevices(req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const deleteUserDeviceHandler = async (req: Request, res: Response) => {
  const { deviceId } = req.params;
  const deviceExists = await userService.findDeviceById(deviceId);
  if (!deviceExists.success) {
    return res.status(deviceExists.statusCode).send(deviceExists);
  }
  if (deviceExists.data.userId !== req.user.userId) {
    const sr = new ServiceResponse('You do not own this device', null, false, 403, 'Unauthorized', 'AUTH_SERVICE_USER_DEVICE_MISMATCH', 'Check that you have the right roles/permission');
    return res.status(sr.statusCode).send(sr);
  }
  const sr = await userService.deleteDeviceById(deviceId);
  return res.status(sr.statusCode).send(sr);
};
