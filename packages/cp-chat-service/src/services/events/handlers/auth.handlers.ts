import { sanitizeData, ServiceEvent, ServiceResponse } from '@cribplug/common';
import { userCreateFields } from '../../../schema/user.schema';
import UserDBService from '../../user.service';

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
  console.log('Handling Event: ', message.type);
  const userService = new UserDBService();
  const userData = sanitizeData(userCreateFields, message.data);
  const sr = await userService.createUser(userData);
  return sr;
};
