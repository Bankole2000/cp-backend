import { ServiceResponse, signJWT, verifyToken } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';
import { logResponse } from './logRequests';

const userService = new UserDBService();

export const requireUserFromIdToken = async (req: Request, res: Response, next: NextFunction) => {
  const idToken = req.headers['x-user-id-token'] || req.body.idToken;
  if (!idToken) {
    const sr = new ServiceResponse('Unauthorized', null, false, 401, 'Unauthorized', 'AUTH_SERVICE_ID_TOKEN_REQUIRED', 'Confirm flow or generate idToken is required');
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
  console.log({ headers: req.headers });
  console.log('here');
  if (!token) {
    const refreshToken = req.cookies?.refreshToken ? req.cookies.refreshToken : req.headers['x-refresh-token'];
    if (refreshToken) {
      const { decoded: refreshDecoded } = await verifyToken(refreshToken, config.self.jwtSecret || '');
      console.log({ refreshDecoded });
      if (!refreshDecoded) {
        req.user = null;
        return next();
      }
      const userExists = await userService.findUserById(refreshDecoded.userId);
      if (!userExists.success) {
        req.user = null;
        return next();
      }
      console.log('User found');
      const { success, data: { sessionId, isValid, deviceId } } = await userService.getSessionById(refreshDecoded.sessionId);
      console.log({ sessionFound: success, isValid, deviceId });
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
    console.log('No Token sent');
    req.user = null;
    return next();
  }
  const accessToken = token.split(' ')[1];
  const refreshToken = req.cookies?.refreshToken ? req.cookies.refreshToken : req.headers['x-refresh-token'];
  console.log({ accessToken, refreshToken, cookies: req.cookies });
  if (!accessToken) {
    req.user = null;
    return next();
  }
  const {
    valid, decoded, error, expired
  } = await verifyToken(accessToken, config.self.jwtSecret || '');
  console.log({ error, expired, valid });
  if (decoded && valid) {
    console.log('accessToken checking user exists');
    const userExists = await userService.findUserById(decoded.userId);
    if (!userExists.success) {
      req.user = null;
      return next();
    }
    const { success, data } = await userService.getSessionById(decoded.sessionId);
    console.log('accessToken checking session exists');
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
  console.log('Using refresh token');
  if (expired && refreshToken) {
    const { decoded: refreshDecoded } = await verifyToken(refreshToken, config.self.jwtSecret || '');
    console.log({ refreshDecoded });
    if (!refreshDecoded) {
      req.user = null;
      return next();
    }
    const userExists = await userService.findUserById(refreshDecoded.userId);
    if (!userExists.success) {
      req.user = null;
      return next();
    }
    console.log('User found');
    const { success, data: { sessionId, isValid, deviceId } } = await userService.getSessionById(refreshDecoded.sessionId);
    console.log({ sessionFound: success, isValid, deviceId });
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

export const requireRole = (roles: string[]) => (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;
  if (!user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'AUTH_SERVICE_USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
    logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const isAuthorized = roles.some((role) => user.roles.includes(role));
  if (!isAuthorized) {
    const sr = new ServiceResponse('Unauthorized', null, false, 403, 'Unauthorized', 'AUTH_SERVICE_USER_NOT_AUTHORIZED', 'You do not have the role(s) or permission(s) to perform this action');
    logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
