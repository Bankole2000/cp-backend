import { Request, Response } from 'express';
// import 'cross-fetch/polyfill';
import { generate as generateOTP } from 'otp-generator';
import { parsePhoneNumberWithError, ParseError, PhoneNumber } from 'libphonenumber-js';
import {
  ServiceResponse, sanitizeData, ServiceEvent, signJWT, hashPassword, userCreateFields, allRoles
} from '@cribplug/common';
import { LoginType } from '@prisma/client';
import UserDBService from '../services/user.service';
import PocketbaseService from '../services/pb.service';
import { logResponse } from '../middleware/logRequests';
import { config } from '../utils/config';
import { getServiceQueues, sendToServiceQueues } from '../services/events.service';

// eslint-disable-next-line @typescript-eslint/no-var-requires, import/no-unresolved
// const PocketBase = require('pocketbase/cjs');

const userService = new UserDBService();
const { pocketbase } = config;
const pb = new PocketbaseService(pocketbase.url as string);

export const registerWithEmailHandler = async (req: Request, res: Response) => {
  // #region STEP: Check if user already exists, Sanitize Data
  const {
    email, firstname
  } = req.body;
  const userExists = await userService.findUserByEmail(email);
  if (userExists.success) {
    const sr = new ServiceResponse('Email already registered', null, false, 400, 'Email already registered', 'Email already registered', null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const userData = sanitizeData(userCreateFields, req.body);
  userData.displayname = `${firstname}`;
  if (!userData.tos) {
    const sr = new ServiceResponse('You need to accept the terms and conditions', null, false, 400, 'TOS not accepted', 'TOS not accepted', 'Please accept terms and conditions');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  // #endregion
  // #region STEP: Create new user
  if (userData.email === config.self.adminEmail) {
    userData.roles = allRoles as string[];
  }
  userData.registeredVia = 'EMAIL' as LoginType;
  const newUserSR = await userService.createUser(userData);
  if (!newUserSR.success) {
    await logResponse(req, newUserSR);
    return res.status(newUserSR.statusCode).send(newUserSR);
  }
  delete newUserSR.data.password;
  const idToken = (await signJWT(newUserSR.data, config.self.jwtSecret as string)).token;
  // #endregion
  // #region STEP: Emit 'USER_CREATED' Event
  const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
  const userCreatedEvent = new ServiceEvent('USER_CREATED', newUserSR.data, idToken, null, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, userCreatedEvent, serviceQueues);
  // #endregion
  // #region STEP: Emit 'SEND_VERIFICATION_EMAIL' Event, Send response
  const commsQueue = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event']);
  const OTP = generateOTP(6, { lowerCaseAlphabets: false, upperCaseAlphabets: true, specialChars: false });
  console.log({ OTP });
  const verifData = {
    userId: newUserSR.data.userId,
    email: newUserSR.data.email,
    OTP,
    type: 'EMAIL',
    expiresIn: 60 * 30 * 1000
  };
  await req.redis.client.connect();
  await req.redis.client.setEx(`${config.redisConfig.scope}:OTP:${verifData.type}:${verifData.userId}`, verifData.expiresIn / 1000, JSON.stringify(verifData));
  await req.redis.client.disconnect();
  const sendVerificationEmailJob = new ServiceEvent('SEND_VERIFICATION_EMAIL', { user: newUserSR.data, idToken, verifData }, idToken, null, config.self.serviceName, commsQueue);
  await sendToServiceQueues(req.channel, sendVerificationEmailJob, commsQueue);
  const sr = new ServiceResponse('Registration Successful', { user: newUserSR.data, idToken }, true, 201, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};

export const registerWithPhoneHandler = async (req: Request, res: Response) => {
  // #region STEP: Check if user already exists, Sanitize Data
  const {
    phone, countryCode, firstname
  } = req.body;
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
  if (userExists.success) {
    const sr = new ServiceResponse('Phone number already registered', null, false, 400, 'Phone number already registered', 'AUTH_SERVICE_PHONE_NUMBER_ALREADY_REGISTERED', null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const userData = sanitizeData(userCreateFields, req.body);
  if (!userData.tos) {
    const sr = new ServiceResponse('You need to accept the terms and conditions', null, false, 400, 'TOS not accepted', 'TOS not accepted', 'Please accept terms and conditions');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  userData.phone = parsedNumber.number;
  const {
    countryCallingCode, nationalNumber, number, country
  } = parsedNumber;
  userData.phoneData = {
    countryCallingCode,
    nationalNumber,
    number,
    country,
    isValid: parsedNumber.isValid(),
    isNonGeographic: parsedNumber.isNonGeographic(),
    type: parsedNumber.getType(),
    formatNational: parsedNumber.formatNational(),
    formatInternational: parsedNumber.formatInternational(),
    uri: parsedNumber.getURI(),
  };
  userData.displayname = `${firstname}`;
  // #endregion
  // #region STEP: Create new user
  if (userData.phone === config.self.adminPhone) {
    userData.roles = allRoles as string[];
  }
  userData.registeredVia = 'PHONE' as LoginType;
  const newUserSR = await userService.createUser(userData);
  if (!newUserSR.success) {
    await logResponse(req, newUserSR);
    return res.status(newUserSR.statusCode).send(newUserSR);
  }
  delete newUserSR.data.password;
  const idToken = (await signJWT(newUserSR.data, config.self.jwtSecret as string)).token;
  // #endregion
  // #region STEP: Emit 'USER_CREATED' Event
  const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
  const userCreatedEvent = new ServiceEvent('USER_CREATED', newUserSR.data, idToken, null, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, userCreatedEvent, serviceQueues);
  // #endregion
  // #region STEP: Emit 'SEND_VERIFICATION_SMS' Event, Send response
  const OTP = generateOTP(6, { lowerCaseAlphabets: false, upperCaseAlphabets: true, specialChars: false });
  console.log({ OTP });
  const verifData = {
    userId: newUserSR.data.userId,
    phone: newUserSR.data.phone,
    OTP,
    type: 'PHONE',
    expiresIn: 60 * 30 * 1000
  };
  await req.redis.client.connect();
  await req.redis.client.setEx(`${config.redisConfig.scope}:OTP:${verifData.type}:${verifData.userId}`, verifData.expiresIn / 1000, JSON.stringify(verifData));
  await req.redis.client.disconnect();
  const commsQueue = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event']);
  const sendVerificationSMSJob = new ServiceEvent('SEND_VERIFICATION_SMS', { user: newUserSR.data, idToken, verifData }, idToken, null, config.self.serviceName, commsQueue);
  await sendToServiceQueues(req.channel, sendVerificationSMSJob, commsQueue);
  const sr = new ServiceResponse('Registration Successful', { user: newUserSR.data, idToken }, true, 201, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};

export const onboardingHandler = async (req: Request, res: Response) => {
  // #region STEP: Check if user exists, Sanitize Data
  const { userId } = req.user;
  if (!userId) {
    const sr = new ServiceResponse('Invalid IdToken', null, false, 400, 'Error', 'AUTH_SERVICE_INVALID_IDTOKEN', 'Send idToken in headers or body');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const userExists = await userService.findUserById(userId);
  if (!userExists.success) {
    await logResponse(req, userExists);
    return res.status(userExists.statusCode).send(userExists);
  }
  const {
    username, password, confirmPassword, gender, idToken
  } = req.body;
  // #endregion
  // #region STEP: TODO: If Phone Registration used, check if phoneNumber is verified
  // #region STEP: TODO: If Email Registration used, check if Email is verified
  // #region STEP: Check if username is taken and passwords match
  const usernameTaken = await userService.findUserByUsername(username);
  if (usernameTaken.success) {
    const suggestedUsernames = await userService.generateUsernameSuggestions(username, userId);
    const sr = new ServiceResponse('Username already taken', { suggestedUsernames }, false, 400, 'Username already taken', 'AUTH_SERVICE_USERNAME_ALREADY_TAKEN', 'Try a different username');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  if (password !== confirmPassword) {
    const sr = new ServiceResponse(
      'Password and confirm password do not match',
      null,
      false,
      400,
      'Password and confirm password do not match',
      'AUTH_SERVICE_PASSWORD_MISMATCH',
      'Enter the same password in both fields',
    );
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const hashedPassword = await hashPassword(password);
  // #endregion
  // #region STEP: Update user, Emit 'USER_UPDATED' Event
  const { onboardingStatus } = userExists.data;
  const obSet = new Set(onboardingStatus);
  obSet.add('USERNAME_SET');
  obSet.add('PASSWORD_SET');
  const updatedUser = await userService.updateUser(userId, {
    username, password: hashedPassword, gender, onboardingStatus: [...obSet]
  });
  if (!updatedUser.success) {
    await logResponse(req, updatedUser);
    return res.status(updatedUser.statusCode).send(updatedUser);
  }
  console.log({ user: updatedUser.data });
  // TODO: create pocketbase user here
  await pb.authenticateAdmin(pocketbase.adminEmail || '', pocketbase.adminPassword || '');
  const pbUserExists = await pb.findUserById(updatedUser.data.userId);
  if (!pbUserExists.success) {
    const newPBUserData = {
      username,
      userId: updatedUser.data.userId,
      email: updatedUser.data.email,
      roles: updatedUser.data.roles,
      verified: updatedUser.data.emailVerified || updatedUser.data.phoneVerified,
      password,
      passwordConfirm: confirmPassword,
      firstname: updatedUser.data.firstname,
      lastname: updatedUser.data.lastname,
      phone: updatedUser.data.phone,
      emailVisibility: true,
    };
    await pb.createUser(newPBUserData);
  } else {
    const updatedPBUserData = {
      username,
      userId: updatedUser.data.userId,
      email: updatedUser.data.email,
      roles: updatedUser.data.roles,
      verified: updatedUser.data.emailVerified || updatedUser.data.phoneVerified,
      password,
      passwordConfirm: confirmPassword,
      firstname: updatedUser.data.firstname,
      lastname: updatedUser.data.lastname,
      phone: updatedUser.data.phone,
      emailVisibility: true,
    };
    await pb.updateUser(pbUserExists.data.id, updatedPBUserData);
  }

  console.log({ pbUser: pbUserExists.data });
  // try {
  //   console.log({ pbUserExists });
  //   console.log({ userData: updatedUser.data, pbUrl: config.pocketbase.url });
  //   const userRecord = await pb.collection('users').create({
  //     username,
  //     userId: updatedUser.data.userId,
  //     email: updatedUser.data.email,
  //     password,
  //     passwordConfirm: confirmPassword,
  //     firstname: updatedUser.data.firstname,
  //     lastname: updatedUser.data.lastname,
  //     phone: updatedUser.data.phone,
  //     emailVisibility: true,
  //   });
  //   console.log({ userRecord });
  // } catch (error: any) {
  //   console.log({ error, data: error.data, info: error.data.data });
  // }
  const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
  const userUpdatedEvent = new ServiceEvent('USER_UPDATED', updatedUser.data, idToken, null, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, userUpdatedEvent, serviceQueues);
  // #endregion
  // #region STEP: Add to trusted Devices, Create user session
  const deviceData = { deviceData: req.useragent, userId, ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null };
  const addDeviceSR = await userService.addApprovedDevice(userId, deviceData);
  if (!addDeviceSR.success) {
    await logResponse(req, addDeviceSR);
    return res.status(addDeviceSR.statusCode).send(addDeviceSR);
  }
  const createSessionSR = await userService.createUserSession(userId, {
    ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
    userAgent: req.headers['user-agent'],
    deviceId: addDeviceSR.data.deviceId,
  });
  if (!createSessionSR.success) {
    await logResponse(req, createSessionSR);
    return res.status(createSessionSR.statusCode).send(createSessionSR);
  }
  const pbAuthData = await pb.authenticateUser(
    updatedUser.data.username,
    password,
  );
  // if ((updatedUser.data.emailVerified || updatedUser.data.phoneVerified)) {
  //   await pb.confirmVerification(pbAuthData.data.token);
  // }
  console.log({ pbAuthData });
  const { data: session } = createSessionSR;
  if (session.user.password) delete session.user.password;
  if (session.device.deviceData) delete session.device.deviceData;
  // #endregion
  // #region STEP: Generate Tokens, Emit 'USER_FIRST_LOGIN' Event, Send response
  const { user, device: { deviceId }, sessionId } = session;
  const accessToken = (await signJWT({
    ...user, sessionId, deviceId, pbToken: pbAuthData.data.token, pbUser: pbAuthData.data.record
  }, config.self.jwtSecret as string, { expiresIn: config.self.accessTokenTTL })).token;
  const refreshToken = (await signJWT({
    ...user, sessionId, deviceId, pbToken: pbAuthData.data.token, pbUser: pbAuthData.data.record
  }, config.self.jwtSecret as string, { expiresIn: config.self.refreshTokenTTL })).token;
  const sr = new ServiceResponse('Onboarding Successful', {
    accessToken, refreshToken, session, user: session.user
  }, true, 200, null, null, null);
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    maxAge: parseInt(config.self.accessTokenTTLMS || '900000', 10),
  });
  await UserDBService.cacheUserSession(req.redis, config.redisConfig.scope || '', session);
  const se = new ServiceEvent('USER_FIRST_LOGIN', session, idToken, accessToken, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, se, serviceQueues);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
  // #endregion
};

export const setNewPasswordHandler = async (req: Request, res: Response) => {
  const { userId } = req.user;
  if (!userId) {
    const sr = new ServiceResponse('Invalid IdToken', null, false, 400, 'Error', 'AUTH_SERVICE_INVALID_IDTOKEN', 'Send idToken in headers or body');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const userExists = await userService.findUserById(userId);
  if (!userExists.success) {
    await logResponse(req, userExists);
    return res.status(userExists.statusCode).send(userExists);
  }
  const {
    password, confirmPassword, idToken, userId: sentUserId, type, email, phone,
  } = req.body;
  if (type === 'EMAIL') {
    if (!email || email !== userExists.data.email) {
      const sr = new ServiceResponse(
        'Invalid email',
        null,
        false,
        400,
        'Error',
        'AUTH_SERVICE_EMAIL_MISMATCH',
        'Send matching email in body',
      );
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
  }
  if (type === 'PHONE') {
    if (!phone || phone !== userExists.data.phone) {
      const sr = new ServiceResponse(
        'Invalid phone number',
        null,
        false,
        400,
        'Error',
        'AUTH_SERVICE_PHONE_MISMATCH',
        'Send matching phone number in body',
      );
      await logResponse(req, sr);
      return res.status(sr.statusCode).send(sr);
    }
  }
  if (userId !== sentUserId) {
    const sr = new ServiceResponse(
      'Invalid userId',
      null,
      false,
      400,
      'Error',
      'AUTH_SERVICE_INVALID_USERID',
      'Send matching userId in body',
    );
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  if (password !== confirmPassword) {
    const sr = new ServiceResponse(
      'Password and confirm password do not match',
      null,
      false,
      400,
      'Password and confirm password do not match',
      'AUTH_SERVICE_PASSWORD_MISMATCH',
      'Enter the same password in both fields',
    );
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const hashedPassword = await hashPassword(password);
  const { onboardingStatus } = userExists.data;
  const obSet = new Set(onboardingStatus);
  obSet.add('PASSWORD_SET');
  const updatedUser = await userService.updateUser(userId, {
    password: hashedPassword, onboardingStatus: [...obSet]
  });
  if (!updatedUser.success) {
    await logResponse(req, updatedUser);
    return res.status(updatedUser.statusCode).send(updatedUser);
  }
  const pbAdminAuth = await pb.authenticateAdmin(pocketbase.adminEmail || '', pocketbase.adminPassword || '');
  if (pbAdminAuth.success) {
    await pb.confirmPasswordReset(pbAdminAuth.data.token, password, confirmPassword);
    await pb.logout();
  }
  const serviceQueues = await getServiceQueues(req.redis, config.redisConfig.scope);
  const userUpdatedEvent = new ServiceEvent('USER_UPDATED', updatedUser.data, idToken, null, config.self.serviceName, serviceQueues);
  await sendToServiceQueues(req.channel, userUpdatedEvent, serviceQueues);
  const sr = new ServiceResponse('Password Updated', updatedUser.data, true, 200, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
