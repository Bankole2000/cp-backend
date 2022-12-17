import {
  ServiceEvent, ServiceResponse, signJWT, verifyToken
} from '@cribplug/common';
import { LoginType } from '@prisma/client';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import { getServiceQueues, sendToServiceQueues } from '../services/events.service';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';

const userService = new UserDBService();
const { self, redisConfig } = config;

export const verifyEmailHandler = async (req: Request, res: Response) => {
  const { email, token } = req.query;
  if (!email || !token) {
    return res.status(400).send('Bad request');
  }

  const user = await userService.findUserByEmail(email as string);
  if (!user) {
    return res.status(400).send('Bad request');
  }

  if (user.data.verificationCode !== token) {
    return res.status(400).send('Bad request');
  }

  await userService.updateUser(user.data.userId, { verified: true });
  return res.send('Email verified');
};

export const verifyDeviceLoginHandler = async (req: Request, res: Response) => {
  const {
    idToken, userId, deviceId, code, type
  } = req.body;
  if (!idToken) {
    const sr = new ServiceResponse('Id Token is required', null, false, 400, 'Id Token is required', 'AUTH_SERVICE_ID_TOKEN_REQUIRED', 'Please provide idToken to authenticate verification requests');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const { decoded: tokenData, error: tokenError, valid: tokenIsValid } = await verifyToken(idToken, config.self.jwtSecret as string);
  if (tokenError || !tokenIsValid) {
    const sr = new ServiceResponse('Invalid Id Token', null, false, 400, 'Invalid Id Token', 'AUTH_SERVICE_ID_TOKEN_INVALID', 'Ask to resend verification code');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const { userId: tokenUserId } = tokenData;
  const userExists = await userService.findUserById(tokenUserId);
  if (!userExists.success) {
    await logResponse(req, userExists);
    return res.status(userExists.statusCode).send(userExists);
  }
  if (req.body[type.toLowerCase()] !== userExists.data[type.toLowerCase()]) {
    const sr = new ServiceResponse('This token is not for this user', null, false, 403, 'User Type Data mismatch', 'AUTH_SERVICE_USER_DATAPOINT_MISMATCH', 'please provide the user data that matches the verification type');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const deviceExists = await userService.findDeviceById(deviceId);
  if (!deviceExists.success) {
    await logResponse(req, deviceExists);
    return res.status(deviceExists.statusCode).send(deviceExists);
  }
  console.log({ tokenData });
  await req.redis.client.connect();
  const codeKey = `${redisConfig.scope}:DVRequest:${type}:${tokenData[type.toLowerCase()]}:${deviceId}`;
  console.log({ codeKey });
  let deviceRequestData = await req.redis.client.get(codeKey);
  console.log({ deviceRequestData });
  if (!deviceRequestData) {
    const sr = new ServiceResponse('Verification Token Expired', null, false, 400, 'Device Login Request Expired', 'AUTH_SERVICE_DEVICE_VERIFICATION_CODE_EXPIRED', 'Request another verification code');
    await logResponse(req, sr);
    await req.redis.client.disconnect();
    return res.status(sr.statusCode).send(sr);
  }
  if (deviceRequestData) {
    deviceRequestData = JSON.parse(deviceRequestData);
  }
  if (tokenUserId !== deviceRequestData.userId) {
    const sr = new ServiceResponse('Unauthorized', null, false, 403, 'Requesting User different from Verification User', 'AUTH_SERVICE_USER_ID_MISMATCH', 'Requesting user and verifying must be the same');
    await logResponse(req, sr);
    await req.redis.client.disconnect();
    return res.status(sr.statusCode).send(sr);
  }
  if (deviceId !== deviceRequestData.deviceId) {
    const sr = new ServiceResponse('Unauthorized', null, false, 403, 'Requesting Device different from Verification Device', 'AUTH_SERVICE_DEVICE_ID_MISMATCH', 'Requesting device Id and verifying device Id must be the same');
    await logResponse(req, sr);
    await req.redis.client.disconnect();
    return res.status(sr.statusCode).send(sr);
  }
  if (!type || type !== deviceRequestData.type) {
    const sr = new ServiceResponse('Verification type is required', null, false, 400, 'Verification type must be indicated', 'AUTH_SERVICE_VERIFICATION_TYPE_MISMATCH', 'Check verification type with login attempt');
    await logResponse(req, sr);
    await req.redis.client.disconnect();
    return res.status(sr.statusCode).send(sr);
  }
  if (code !== deviceRequestData.OTP) {
    const sr = new ServiceResponse('Invalid or Incorrect verification code', null, false, 400, 'Incorrect verification code', 'AUTH_SERVICE_INCORRECT_VERIFICATION_CODE', 'Check verification code and try again');
    await logResponse(req, sr);
    await req.redis.client.disconnect();
    return res.status(sr.statusCode).send(sr);
  }
  await req.redis.client.del(codeKey);
  await req.redis.client.disconnect();
  const approvedDevice = await userService.updateDeviceById(deviceId, { active: true });
  await userService.invalidateSameDevicePreviousSessions(req.redis, config.redisConfig.scope || '', userExists.data.userId, approvedDevice.data.deviceId);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || null;
  const userAgent = req.headers['user-agent'];
  const createSessionSR = await userService.createUserSession(userExists.data.userId, {
    ip,
    userAgent,
    deviceId: approvedDevice.data.deviceId,
    loginType: type === 'PHONE' ? 'PHONE' as LoginType : 'EMAIL' as LoginType,
  });
  if (!createSessionSR.success) {
    await logResponse(req, createSessionSR);
    return res.status(createSessionSR.statusCode).send(createSessionSR);
  }
  const { data: session } = createSessionSR;
  if (session.user.password) delete session.user.password;
  if (session.device.deviceData) delete session.device.deviceData;
  const { user, sessionId } = session;
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
};

export const verifyPhoneHandler = async (req: Request, res: Response) => {
  const { phone, token } = req.query;
  if (!phone || !token) {
    return res.status(400).send('Bad request');
  }

  const user = await userService.findUserByPhoneNumber(phone as string);
  if (!user) {
    return res.status(400).send('Bad request');
  }

  if (user.data.verificationCode !== token) {
    return res.status(400).send('Bad request');
  }

  await userService.updateUser(user.data.userId, { verified: true });
  return res.send('Phone verified');
};

export const sendEmailVerificationCodeHandler = async (req: Request, res: Response) => {
  const { email } = req.query;
  if (!email) {
    return res.status(400).send('Bad request');
  }

  const user = await userService.findUserByEmail(email as string);
  if (!user) {
    return res.status(400).send('Bad request');
  }

  const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  await userService.updateUser(user.data.userId, { verificationCode });

  return res.send('Verification code sent');
};

export const sendPhoneVerificationCodeHandler = async (req: Request, res: Response) => {
  const { phone } = req.query;
  if (!phone) {
    return res.status(400).send('Bad request');
  }

  const user = await userService.findUserByPhoneNumber(phone as string);
  if (!user) {
    return res.status(400).send('Bad request');
  }

  const verificationCode = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  await userService.updateUser(user.data.userId, { verificationCode });

  return res.send('Verification code sent');
};

export const sendEmailDeviceVerificationHandler = async (req: Request, res: Response) => {
  res.send('Email Verification code sent');
};

export const sendPhoneDeviceVerificationHandler = async (req: Request, res: Response) => {
  res.send('Phone Verification code sent');
};
