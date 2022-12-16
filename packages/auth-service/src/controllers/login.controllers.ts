import { Request, Response } from 'express';
import { parsePhoneNumberWithError, ParseError, PhoneNumber } from 'libphonenumber-js';
import {
  ServiceEvent, ServiceResponse, signJWT, verifyPassword
} from '@cribplug/common';
import { logResponse } from '../middleware/logRequests';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';
import { getServiceQueues, sendToServiceQueues } from '../services/events.service';
import { LoginType } from '@prisma/client';

const userService = new UserDBService();

export const emailLoginHandler = async (req: Request, res: Response) => {
  // #region STEP: Check user exists and Sanitize Data
  const { email, password } = req.body;
  const userExists = await userService.findUserByEmail(email);
  if (!userExists.success) {
    await logResponse(req, userExists);
    return res.status(userExists.statusCode).send(userExists);
  }
  const { password: hashedPassword } = userExists.data;
  const passwordMatch = await verifyPassword(password, hashedPassword);
  if (!passwordMatch) {
    const sr = new ServiceResponse('Invalid Password', null, false, 400, 'Invalid Password', 'AUTH_SERVICE_INVALID_PASSWORD', 'Enter the correct password');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  // #endregion
  // #region STEP: Check if device is trusted
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'];
  const deviceApproved = await userService.checkIfDeviceIsApproved(userExists.data.userId, ip as string);
  if (!deviceApproved.success) {
    // #region STEP: If device not trusted - Send email to user to approve device
    if (deviceApproved.statusCode === 404) {
      const commsQueue = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event']);
      const DVRequestData = {
        user: userExists.data, ip, userAgent, userAgentData: req.useragent, expiresIn: parseInt(config.self.accessTokenTTLMS as string, 10) / 2
      };
      await req.redis.client.connect();
      await req.redis.client.setex(`${config.redisConfig.scope}:DVRequest:${userExists.data.email}:${ip}`, DVRequestData.expiresIn / 1000, JSON.stringify(DVRequestData));
      await req.redis.client.disconnect();
      const se = new ServiceEvent('SEND_DEVICE_APPROVAL_EMAIL', DVRequestData, null, null, config.self.serviceName, commsQueue);
      await sendToServiceQueues(req.channel, se, commsQueue);
    }
    // #endregion
    await logResponse(req, deviceApproved);
    return res.status(deviceApproved.statusCode).send(deviceApproved);
  }
  // #endregion
  // #region STEP: Create User Session, Tokens
  await userService.invalidateSameDevicePreviousSessions(req.redis, config.redisConfig.scope || '', userExists.data.userId, deviceApproved.data.deviceId,);
  const createSessionSR = await userService.createUserSession(userExists.data.userId, {
    ip,
    userAgent,
    deviceId: deviceApproved.data.deviceId,
    loginType: 'EMAIL' as LoginType
  });
  if (!createSessionSR.success) {
    await logResponse(req, createSessionSR);
    return res.status(createSessionSR.statusCode).send(createSessionSR);
  }
  const { data: session } = createSessionSR;
  if (session.user.password) delete session.user.password;
  if (session.device.deviceData) delete session.device.deviceData;
  const { user, device: { deviceId }, sessionId } = session;
  const accessToken = (await signJWT({ ...user, sessionId, deviceId }, config.self.jwtSecret as string, { expiresIn: config.self.accessTokenTTL })).token;
  const refreshToken = (await signJWT({ ...user, sessionId, deviceId }, config.self.jwtSecret as string, { expiresIn: config.self.refreshTokenTTL })).token;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: parseInt(config.self.refreshTokenTTLMS || '604800000', 10),
  });
  // #endregion
  // #region STEP: Cache User Session, Emit 'USER_LOGGED_IN' Event and send response
  const sr = new ServiceResponse('Login Successful', {
    accessToken, refreshToken, session, user: session.user
  }, true, 200, null, null, null);
  await UserDBService.cacheUserSession(req.redis, config.redisConfig.scope || '', session);
  const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
  const se = new ServiceEvent('USER_LOGGED_IN', session, null, accessToken, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, se, serviceQueues);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};

export const phoneLoginHandler = async (req: Request, res: Response) => {
  const { phone, countryCode, password } = req.body;
  let parsedNumber: PhoneNumber | undefined;
  try {
    parsedNumber = parsePhoneNumberWithError(phone, countryCode);
  } catch (error: any) {
    if (error instanceof ParseError) {
      const sr = new ServiceResponse('Error parsing phone number', null, false, 400, error.message, error, 'Check phone number and country code');
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
    const sr = new ServiceResponse('Invalid phone number', null, false, 400, error.message, error, 'Check phone number and country code');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  if (!parsedNumber || !parsedNumber.isValid()) {
    const sr = new ServiceResponse('Invalid phone number', null, false, 400, 'Invalid phone number', 'AUTH_SERVICE_INVALID_PHONE_NUMBER', 'Check phone number and country code');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const userExists = await userService.findUserByPhoneNumber(parsedNumber.number);
  if (!userExists.success) {
    await logResponse(req, userExists);
    return res.status(userExists.statusCode).send(userExists);
  }
  const { password: hashedPassword } = userExists.data;
  const passwordMatch = await verifyPassword(password, hashedPassword);
  if (!passwordMatch) {
    const sr = new ServiceResponse('Invalid Password', null, false, 400, 'Invalid Password', 'AUTH_SERVICE_INVALID_PASSWORD', 'Enter the correct password');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'];
  const deviceApproved = await userService.checkIfDeviceIsApproved(userExists.data.userId, ip as string);
  if (!deviceApproved.success) {
    // #region STEP: If device not trusted - Send email to user to approve device
    if (deviceApproved.statusCode === 404) {
      const commsQueue = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event']);
      const DVRequestData = {
        user: userExists.data, ip, userAgent, userAgentData: req.useragent, expiresIn: parseInt(config.self.accessTokenTTLMS as string, 10) / 2
      };
      await req.redis.client.connect();
      await req.redis.client.setex(`${config.redisConfig.scope}:DVRequest:${userExists.data.email}:${ip}`, DVRequestData.expiresIn / 1000, JSON.stringify(DVRequestData));
      await req.redis.client.disconnect();
      const se = new ServiceEvent('SEND_DEVICE_APPROVAL_EMAIL', DVRequestData, null, null, config.self.serviceName, commsQueue);
      await sendToServiceQueues(req.channel, se, commsQueue);
    }
    // #endregion
    await logResponse(req, deviceApproved);
    return res.status(deviceApproved.statusCode).send(deviceApproved);
  }
  await userService.invalidateSameDevicePreviousSessions(req.redis, config.redisConfig.scope || '', userExists.data.userId, deviceApproved.data.deviceId,);
  const createSessionSR = await userService.createUserSession(userExists.data.userId, {
    ip,
    userAgent,
    deviceId: deviceApproved.data.deviceId,
    loginType: 'PHONE' as LoginType
  });
  if (!createSessionSR.success) {
    await logResponse(req, createSessionSR);
    return res.status(createSessionSR.statusCode).send(createSessionSR);
  }
  const { data: session } = createSessionSR;
  if (session.user.password) delete session.user.password;
  if (session.device.deviceData) delete session.device.deviceData;
  const { user, device: { deviceId }, sessionId } = session;
  const accessToken = (await signJWT({ ...user, sessionId, deviceId }, config.self.jwtSecret as string, { expiresIn: config.self.accessTokenTTL })).token;
  const refreshToken = (await signJWT({ ...user, sessionId, deviceId }, config.self.jwtSecret as string, { expiresIn: config.self.refreshTokenTTL })).token;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: parseInt(config.self.refreshTokenTTLMS || '604800000', 10),
  });
  // #endregion
  // #region STEP: Cache User Session, Emit 'USER_LOGGED_IN' Event and send response
  const sr = new ServiceResponse('Login Successful', {
    accessToken, refreshToken, session, user: session.user
  }, true, 200, null, null, null);
  await UserDBService.cacheUserSession(req.redis, config.redisConfig.scope || '', session);
  const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
  const se = new ServiceEvent('USER_LOGGED_IN', session, null, accessToken, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, se, serviceQueues);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
}

export const usernameLoginHandler = async (req: Request, res: Response) => {
  // #region STEP: Check user exists and Sanitize Data
  const { username, password } = req.body;
  const userExists = await userService.findUserByUsername(username);
  if (!userExists.success) {
    await logResponse(req, userExists);
    return res.status(userExists.statusCode).send(userExists);
  }
  const { password: hashedPassword } = userExists.data;
  const passwordMatch = await verifyPassword(password, hashedPassword);
  if (!passwordMatch) {
    const sr = new ServiceResponse('Invalid Password', null, false, 400, 'Invalid Password', 'AUTH_SERVICE_INVALID_PASSWORD', 'Enter the correct password');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  // #endregion
  // #region STEP: Check if device is trusted
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'];
  const deviceApproved = await userService.checkIfDeviceIsApproved(userExists.data.userId, ip as string);
  if (!deviceApproved.success) {
    // #region STEP: If device not trusted - Send email to user to approve device
    if (deviceApproved.statusCode === 404) {
      const commsQueue = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event']);
      const DVRequestData = {
        user: userExists.data, ip, userAgent, userAgentData: req.useragent, expiresIn: parseInt(config.self.accessTokenTTLMS as string, 10) / 2
      };
      await req.redis.client.connect();
      await req.redis.client.setex(`${config.redisConfig.scope}:DVRequest:${userExists.data.email}:${ip}`, DVRequestData.expiresIn / 1000, JSON.stringify(DVRequestData));
      await req.redis.client.disconnect();
      const se = new ServiceEvent('SEND_DEVICE_APPROVAL_EMAIL', DVRequestData, null, null, config.self.serviceName, commsQueue);
      await sendToServiceQueues(req.channel, se, commsQueue);
    }
    // #endregion
    await logResponse(req, deviceApproved);
    return res.status(deviceApproved.statusCode).send(deviceApproved);
  }
  // #endregion
  // #region STEP: Create User Session, Tokens
  await userService.invalidateSameDevicePreviousSessions(req.redis, config.redisConfig.scope || '', userExists.data.userId, deviceApproved.data.deviceId);
  const createSessionSR = await userService.createUserSession(userExists.data.userId, {
    ip,
    userAgent,
    deviceId: deviceApproved.data.deviceId,
    loginType: userExists.data.registeredVia as LoginType
  });
  if (!createSessionSR.success) {
    await logResponse(req, createSessionSR);
    return res.status(createSessionSR.statusCode).send(createSessionSR);
  }
  const { data: session } = createSessionSR;
  if (session.user.password) delete session.user.password;
  if (session.device.deviceData) delete session.device.deviceData;
  const { user, device: { deviceId }, sessionId } = session;
  const accessToken = (await signJWT({ ...user, sessionId, deviceId }, config.self.jwtSecret as string, { expiresIn: config.self.accessTokenTTL })).token;
  const refreshToken = (await signJWT({ ...user, sessionId, deviceId }, config.self.jwtSecret as string, { expiresIn: config.self.refreshTokenTTL })).token;
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  // #endregion
  // #region STEP: Cache User Session, Emit 'USER_LOGGED_IN' Event and send response
  const sr = new ServiceResponse('Login Successful', {
    accessToken, refreshToken, session, user: session.user
  }, true, 200, null, null, null);
  await UserDBService.cacheUserSession(req.redis, config.redisConfig.scope || '', session);
  const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
  const se = new ServiceEvent('USER_LOGGED_IN', session, null, accessToken, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, se, serviceQueues);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};

export const logoutHandler = async (req: Request, res: Response) => {
  // #region STEP: Invalidate User Session
  const { sessionId } = req.user;
  const sr = await userService.invalidateUserSession(req.redis, config.redisConfig.scope || '', sessionId);
  if (sr.success) {
    res.clearCookie('refreshToken');
  }
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};
