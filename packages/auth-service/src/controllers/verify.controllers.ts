import {
  ServiceEvent, ServiceResponse, signJWT, verifyToken
} from '@cribplug/common';
import { generate as generateOTP } from 'otp-generator';
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

export const resendOTPHandler = async (req: Request, res: Response) => {
  const {
    type, email, phone, userId, idToken
  } = req.body;
  const userExistsSR = await userService.findUserById(req.user.userId);
  if (!userExistsSR.success) {
    await logResponse(req, userExistsSR);
    return res.status(userExistsSR.statusCode).send(userExistsSR);
  }
  const { data: user } = userExistsSR;
  if (user.userId !== userId) {
    const sr = new ServiceResponse('User Id does not match', null, false, 403, 'Invalid or unauthorized request - User does not match', 'AUTH_SERVICE_USER_ID_MISMATCH', 'Please user the userId associated with your account');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const OTP = generateOTP(6, { lowerCaseAlphabets: false, upperCaseAlphabets: true, specialChars: false });
  let verifData;
  let se;
  const commsQueue = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event']);
  if (type === 'EMAIL') {
    if (user.email !== email) {
      const sr = new ServiceResponse('Email does not match', null, false, 403, 'Invalid or unauthorized request - Email does not match', 'AUTH_SERVICE_EMAIL_MISMATCH', 'Please use the email associated with your account');
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
    verifData = {
      email,
      OTP,
      type,
      userId: user.userId,
      expiresIn: 60 * 30 * 1000,
    };
    se = new ServiceEvent('SEND_VERIFICATION_EMAIL', { user, idToken, verifData }, idToken, null, config.self.serviceName, commsQueue);
  }
  if (type === 'PHONE') {
    if (user.phone !== phone) {
      const sr = new ServiceResponse('Phone does not match', null, false, 403, 'Invalid or unauthorized request - Phone does not match', 'AUTH_SERVICE_PHONE_MISMATCH', 'Please use the phone number associated with your account');
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
    verifData = {
      phone,
      OTP,
      type,
      userId: user.userId,
      expiresIn: 60 * 30 * 1000,
    };
    se = new ServiceEvent('SEND_VERIFICATION_SMS', { user, idToken, verifData }, idToken, null, config.self.serviceName, commsQueue);
  }
  if (!verifData) {
    const sr = new ServiceResponse('Invalid verification type', null, false, 400, 'Invalid or unauthorized request - Invalid verification type', 'AUTH_SERVICE_INVALID_VERIFICATION_TYPE', 'Please use a valid verification type');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  await req.redis.client.connect();
  await req.redis.client.setEx(`${config.redisConfig.scope}:OTP:${verifData.type}:${verifData.userId}`, verifData.expiresIn / 1000, JSON.stringify(verifData));
  await req.redis.client.disconnect();
  await sendToServiceQueues(req.channel, se, commsQueue);
  const sr = new ServiceResponse('OTP resent', null, true, 200, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const verifyOTPHandler = async (req: Request, res: Response) => {
  const {
    OTP, type, email, phone, userId
  } = req.body;
  const userExistsSR = await userService.findUserById(req.user.userId);
  if (!userExistsSR.success) {
    await logResponse(req, userExistsSR);
    return res.status(userExistsSR.statusCode).send(userExistsSR);
  }
  const { data: user } = userExistsSR;
  await req.redis.client.connect();
  const codeKey = `${redisConfig.scope}:OTP:${type}:${user.userId}`;
  const verifData = await req.redis.client.get(codeKey);
  if (!verifData) {
    await req.redis.client.disconnect();
    const sr = new ServiceResponse('OTP invalid or expired', null, false, 403, 'Invalid or unauthorized request - OTP not found', 'AUTH_SERVICE_OTP_NOT_FOUND', 'Please request for a new OTP');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const parsedVerifData = JSON.parse(verifData);
  if (parsedVerifData.OTP !== OTP) {
    await req.redis.client.disconnect();
    const sr = new ServiceResponse('Incorrect OTP', null, false, 403, 'Invalid or unauthorized request - OTP mismatch', 'AUTH_SERVICE_OTP_MISMATCH', 'Please provide the correct OTP');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  if (parsedVerifData.userId !== user.userId || parsedVerifData.userId !== userId) {
    await req.redis.client.disconnect();
    const sr = new ServiceResponse('Unauthorized', null, false, 403, 'Invalid or unauthorized request - User Id mismatch', 'AUTH_SERVICE_USER_ID_MISMATCH', 'Only the user can verify the OTP');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  if (type === 'EMAIL') {
    if (user.email !== email || parsedVerifData.email !== email) {
      const sr = new ServiceResponse('Unauthorized', null, false, 403, 'Invalid or unauthorized request - Email mismatch', 'AUTH_SERVICE_EMAIL_MISMATCH', 'Please provide the email that matches the user');
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
    const updateUserSR = await userService.updateUser(user.userId, { emailVerified: true });
    if (!updateUserSR.success) {
      await logResponse(req, updateUserSR);
      return res.status(updateUserSR.statusCode).send(updateUserSR);
    }
    await req.redis.client.del(codeKey);
    await req.redis.client.disconnect();
    const { data: updatedUser } = updateUserSR;
    const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
    const se = new ServiceEvent('USER_UPDATED', updatedUser, req.body.idToken, null, config.self.serviceName, serviceQueues);
    await sendToServiceQueues(req.channel, se, serviceQueues);
    const activeSessionsSR = await userService.getUserActiveSessions(user.userId);
    console.log({ activeSessionsSR });
    if (!activeSessionsSR.success) {
      const sr = new ServiceResponse('Email Verified', updatedUser, true, 200, null, null, null);
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
    const { data: activeSessions } = activeSessionsSR;
    const activeSessionIds = activeSessions.map((session: any) => session.sessionId);
    console.log({ activeSessionIds });
    if (activeSessionIds.length) {
      await UserDBService.updateUserSessionsData(req.redis, config.redisConfig.scope as string, activeSessionIds, updatedUser);
    }
    const sr = new ServiceResponse('Email Verified', updatedUser, true, 200, null, null, null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  if (type === 'PHONE') {
    if (user.phone !== phone || parsedVerifData.phone !== phone) {
      const sr = new ServiceResponse('Unauthorized', null, false, 403, 'Invalid or unauthorized request - Email mismatch', 'AUTH_SERVICE_EMAIL_MISMATCH', 'Please provide the email that matches the user');
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
    const updateUserSR = await userService.updateUser(user.userId, { phoneVerified: true });
    if (!updateUserSR.success) {
      await logResponse(req, updateUserSR);
      return res.status(updateUserSR.statusCode).send(updateUserSR);
    }
    const { data: updatedUser } = updateUserSR;
    await req.redis.client.del(codeKey);
    await req.redis.client.disconnect();
    const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
    const se = new ServiceEvent('USER_UPDATED', updatedUser, req.body.idToken, null, config.self.serviceName, serviceQueues);
    await sendToServiceQueues(req.channel, se, serviceQueues);
    const activeSessionsSR = await userService.getUserActiveSessions(user.userId);
    console.log({ activeSessionsSR });
    if (!activeSessionsSR.success) {
      const sr = new ServiceResponse('Phone number Verified', updatedUser, true, 200, null, null, null);
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
    const { data: activeSessions } = activeSessionsSR;
    const activeSessionIds = activeSessions.map((session: any) => session.sessionId);
    console.log({ activeSessionIds });
    if (activeSessionIds.length) {
      await UserDBService.updateUserSessionsData(req.redis, config.redisConfig.scope as string, activeSessionIds, updatedUser);
    }
    const sr = new ServiceResponse('Phone number Verified', updatedUser, true, 200, null, null, null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse('Invalid Verification Type', null, false, 400, 'Invalid Verification Type', 'AUTH_SERVICE_INVALID_VERIFICATION_TYPE', 'Please provide a valid verification type');
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
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
