import { sanitizeData, ServiceEvent, ServiceResponse } from '@cribplug/common';
import { userCreateFields } from '../../../schema/user.schema';
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

export const USER_PURGED = async (message: ServiceEvent) => {
  const { userId } = message.data;
  const userExists = await userService.findUserById(userId);
  if (!userExists.success) {
    console.log(userExists.errors);
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
