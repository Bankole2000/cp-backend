import {
  sanitizeData,
  ServiceResponse,
  signJWT,
  verifyToken,
  userCreateFields,
  redisConnect,
  RedisConnection
} from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import PBService from '../services/pb.service';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';
import { logResponse } from './logRequests';

const userService = new UserDBService();
const { self, redisConfig, pocketbase } = config;

const pb = new PBService(pocketbase.url as string);

export const requireLoggedInUser = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'POST_SERVICE_USER_NOT_AUTHENTICATED', 'You need to be Logged in to perform this action');
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
    const { pbUser, pbToken } = decoded;
    const userExists = await userService.findUserById(decoded.userId);
    if (!userExists.success) {
      // const { redis } = req;
      const redis: RedisConnection = redisConnect(redisConfig.url || '', redisConfig.scope || '');
      const session = await UserDBService.getUserSession(redis, redisConfig.scope || '', decoded.sessionId);
      if (!session || !JSON.parse(session)) {
        req.user = null;
        return next();
      }
      const {
        isValid, user, deviceId, sessionId
      } = JSON.parse(session);
      if (!isValid) {
        req.user = null;
        return next();
      }
      const userData = sanitizeData(userCreateFields, user);
      const createdUser = await userService.createUser(userData);
      if (createdUser.success) {
        req.user = {
          ...user, deviceId, sessionId, pbUser, pbToken
        };
        return next();
      }
      req.user = null;
      return next();
    }
    // const { redis } = req;
    const redis: RedisConnection = redisConnect(redisConfig.url || '', redisConfig.scope || '');
    const session = await UserDBService.getUserSession(redis, redisConfig.scope || '', decoded.sessionId);
    if (!session || !JSON.parse(session)) {
      req.user = null;
      return next();
    }

    const {
      isValid, user, deviceId, sessionId
    } = JSON.parse(session);
    if (!isValid) {
      req.user = null;
      return next();
    }

    req.user = {
      ...user, deviceId, sessionId, pbUser, pbToken
    };
    return next();
  }
  console.log('Line 85');
  console.log({ refreshToken });
  if (!refreshToken) {
    req.user = null;
    return next();
  }
  console.log('Line 90');
  if (expired && refreshToken) {
    const { decoded: refreshDecoded } = await verifyToken(refreshToken, config.self.jwtSecret || '');
    if (!refreshDecoded) {
      req.user = null;
      return next();
    }
    const { pbUser: oldUser, pbToken: oldToken } = refreshDecoded;
    const userExists = await userService.findUserById(refreshDecoded.userId);
    if (!userExists.success) {
      const redis: RedisConnection = redisConnect(redisConfig.url || '', redisConfig.scope || '');
      const session = await UserDBService.getUserSession(redis, redisConfig.scope || '', refreshDecoded.sessionId);
      if (!session || !JSON.parse(session)) {
        req.user = null;
        return next();
      }
      const {
        isValid, user, deviceId, sessionId
      } = JSON.parse(session);
      if (!isValid) {
        req.user = null;
        return next();
      }
      const userData = sanitizeData(userCreateFields, user);
      const createdUser = await userService.createUser(userData);
      if (createdUser.success) {
        const { token: pbToken, record: pbUser } = await pb.saveAuth(oldToken, oldUser);
        const pbIsValid = await pb.checkAuth();
        console.log({ pbIsValid, pbToken, pbUser });
        // const { token: pbToken, record: pbUser } = (await pb.refreshAuth()).data;
        req.user = {
          ...user, deviceId, sessionId, pbUser, pbToken
        };
        const newAccessToken = (await signJWT({
          ...user, deviceId, sessionId, pbUser, pbToken
        }, self.jwtSecret as string, { expiresIn: self.accessTokenTTL })).token;
        res.locals.newAccessToken = newAccessToken;
        res.setHeader('x-access-token', newAccessToken as string);
        return next();
      }
      req.user = null;
      return next();
    }
    const redis: RedisConnection = redisConnect(redisConfig.url || '', redisConfig.scope || '');
    const session = await UserDBService.getUserSession(redis, redisConfig.scope || '', refreshDecoded.sessionId).catch((err) => {
      console.log({ err });
      return null;
    });
    if (!session || !JSON.parse(session)) {
      req.user = null;
      return next();
    }
    const {
      isValid, user, deviceId, sessionId
    } = JSON.parse(session);
    if (!isValid) {
      req.user = null;
      return next();
    }
    const { token: pbToken, record: pbUser } = await pb.saveAuth(oldToken, oldUser);
    const pbIsValid = await pb.checkAuth();
    console.log({ pbIsValid, pbToken, pbUser });
    // const { token: pbToken, record: pbUser } = (await pb.refreshAuth()).data;
    req.user = {
      ...user, deviceId, sessionId, pbUser, pbToken
    };
    const newAccessToken = (await signJWT({
      ...user, deviceId, sessionId, pbUser, pbToken
    }, self.jwtSecret as string, { expiresIn: self.accessTokenTTL })).token;
    res.locals.newAccessToken = newAccessToken;
    res.setHeader('x-access-token', newAccessToken as string);
    return next();
  }
  req.user = null;
  return next();
};

export const requireRole = (roles: string[]) => (
  req: Request,
  res: Response,
  next: NextFunction
) => {
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
