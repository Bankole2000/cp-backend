import { ServiceResponse, signJWT, verifyToken } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';
import { logResponse } from './logRequests';

const userService = new UserDBService();

export const requireUserFromIdToken = async (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.headers['x-user-id-token'] || req.body.idToken;
  if (!idToken) {
    const sr = new ServiceResponse('Unauthorized', null, false, 401, 'Unauthorized', 'idToken is required', 'idToken is required');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const { valid, decoded, error } = await verifyToken(idToken, config.self.jwtSecret || '');
  if (!valid) {
    const sr = new ServiceResponse('Unauthorized', null, false, 401, 'Unauthorized', error, null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  req.user = decoded;
  return next();
};

export const requireLoggedInUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'AUTH_SERVICE_USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const getUserIfLoggedIn = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization;
  if (!token) {
    req.user = null;
    return next();
  }
  const accessToken = token.split(' ')[1];
  const refreshToken = req.cookies?.refreshToken || req.headers['x-refresh-token'];
  if (!accessToken) {
    req.user = null;
    return next();
  }
  const {
    valid, decoded, error, expired
  } = await verifyToken(accessToken, config.self.jwtSecret || '');
  if (decoded && valid) {
    const userExists = await userService.findUserById(decoded.userId);
    if (!userExists.success) {
      req.user = null;
      return next();
    }
    const { success, data } = await userService.getSessionById(decoded.sessionId);
    if (!success || !data.isValid) {
      req.user = null;
      return next();
    }
    req.user = decoded;
    return next();
  }
  if (!refreshToken) {
    req.user = null;
    return next();
  }
  if (expired && refreshToken) {
    const { decoded: refreshDecoded } = await verifyToken(refreshToken, config.self.jwtSecret || '');
    if (!refreshDecoded) {
      req.user = null;
      return next();
    }
    const userExists = await userService.findUserById(refreshDecoded.userId);
    if (!userExists.success) {
      req.user = null;
      return next();
    }
    const { success, data: { sessionId, isValid, deviceId } } = await userService.getSessionById(refreshDecoded.sessionId);
    if (!success || !isValid) {
      req.user = null;
      return next();
    }
    const newAccessToken = (await signJWT({ ...userExists.data, sessionId, deviceId }, config.self.jwtSecret as string, { expiresIn: config.self.accessTokenTTL })).token;
    res.locals.newAccessToken = newAccessToken;
    res.setHeader('x-access-token', newAccessToken as string);
    req.user = refreshDecoded;
    return next();
  }
  req.user = null;
  return next();
};

export const requireSystemUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isSystemUser) {
    const sr = new ServiceResponse('Unauthorized', null, false, 401, 'Unauthorized', 'AUTH_SERVICE_USER_NOT_AUTHORIZED', 'You need to be a System User to perform this action');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
