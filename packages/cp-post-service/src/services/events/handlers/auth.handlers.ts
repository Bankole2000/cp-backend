import {
  sanitizeData, ServiceEvent, ServiceResponse, userCreateFields, userUpdateFields
} from '@cribplug/common';
import { config } from '../../../utils/config';
import UserDBService from '../../user.service';

const userService = new UserDBService();
const { serviceName, emoji } = config.self;

export const authDefaultJobHandler = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const authDefaultExchangeHandler = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const USER_FIRST_LOGIN = async (message: ServiceEvent) => {
  const { userId } = message.data;
  const userExists = await userService.findUserById(userId);
  if (!userExists.success) {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Error Handling Event: ${message.type}: ${userExists.errors}`);
    return userExists;
  }
  console.log(`${emoji} ${serviceName?.toUpperCase()} Handled Event: ${message.type}`);
  // #region STEP: TODO: Create a default chatroom for user support
  // #region STEP: TODO: Update user as logged in
  // #region STEP: TODO: Broadcast user logged in chat socket event
  return userExists;
};

export const USER_LOGGED_IN = async (message: ServiceEvent) => {
  console.log({ message });
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message NOT Yet handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const USER_CREATED = async (message: ServiceEvent) => {
  const userData = sanitizeData(userCreateFields, message.data);
  const sr = await userService.createUser(userData);
  if (sr.success) {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Handled Event: ${message.type}`);
  } else {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Failed to Handle Event: ${message.type}`);
  }
  return sr;
};

export const USER_UPDATED = async (message: ServiceEvent) => {
  const userData = sanitizeData(userUpdateFields, message.data);
  const { userId, version: newVersion } = message.data;
  const userExists = await userService.findUserById(userId);
  if (!userExists.success) {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Error Handling Event: ${message.type}: ${userExists.errors}`);
    return userExists;
  }
  const { data: { version: oldVersion } } = userExists;
  if (oldVersion >= newVersion) {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Skipped Handling Event: ${message.type}: New Version is less than or equal to the current version`);
    const sr = new ServiceResponse('Version mismatch - skipped', { oldVersion, newVersion }, true, 200, 'Version mismatch', 'CHAT_SERVICE_VERSION_MISMATCH', 'Check version and try again');
    return sr;
  }
  userData.version = {
    set: newVersion,
  };
  const sr = await userService.updateUser(userId, userData);
  if (sr.success) {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Handled Event: ${message.type}`);
  } else {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Failed to Handle Event: ${message.type}`);
  }
  return sr;
};

export const USER_PURGED = async (message: ServiceEvent) => {
  const { userId } = message.data;
  const userExists = await userService.findUserById(userId);
  if (!userExists.success) {
    const sr = new ServiceResponse('User not found', null, true, 404, null, null, null);
    return sr;
  }
  const sr = await userService.purgeUserAccount(userId);
  if (sr.success) {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Handled Event: ${message.type}`);
  } else {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Failed to Handle Event: ${message.type}`);
  }
  return sr;
};
