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
  console.log('Handling Event: ', message.type);
  const userData = sanitizeData(userCreateFields, message.data);
  const sr = await userService.createUser(userData);
  if (sr.success) {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Handed Event: ${message.type}`);
  } else {
    console.log(`${emoji} ${serviceName?.toUpperCase()} Failed to Hand Event: ${message.type}`);
  }
  return sr;
};
