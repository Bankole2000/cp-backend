import { ServiceEvent, ServiceResponse, countries } from '@cribplug/common';
import { getCountries } from 'libphonenumber-js';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import { getServiceQueues, sendToServiceQueues } from '../services/events.service';
import UserDBService from '../services/user.service';
import { config } from '../utils/config';

const { self, redisConfig } = config;
const userService = new UserDBService();

// #region TODO: Purge Request Logs Hander, all, by UserId, if error, by ErrorId, self
// #region TODO: Purge Sessions Handler, all, by UserId, self
// #region TODO: Purge Approved Devices Handler, all, by UserId, self

export const addUserRoleHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  const sr = await userService.setUserRoles(userId, role);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const systemPurgeUserHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const userExists = await userService.findUserById(userId);
  if (!userExists.success) {
    const sr = new ServiceResponse('User not found', null, false, 404, 'User not found', 'AUTH_SERVICE_USER_NOT_FOUND', 'User not found');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const purgeSessionsSR = await userService.purgeUserSessions(req.redis, redisConfig.scope as string, userId);
  console.log(purgeSessionsSR.message);
  const purgeUserSR = await userService.purgeUserAccount(userId);
  if (purgeUserSR.success) {
    const serviceQueues = await getServiceQueues(req.redis, redisConfig.scope || '');
    const userAccessToken = req.headers.authorization?.split(' ')[1] || null;
    const se = new ServiceEvent('USER_PURGED', { userId }, null, userAccessToken, self.serviceName, serviceQueues);
    await sendToServiceQueues(req.channel, se, serviceQueues);
  }
  await logResponse(req, purgeUserSR);
  return res.status(purgeUserSR.statusCode).send(purgeUserSR);
};

export const getPhoneCountryCodes = async (req: Request, res: Response) => {
  const countryCodes = getCountries();
  const countryPhoneObject: { [key: string]: any } = {};
  const indices = Object.keys(countries);
  indices.forEach((index) => {
    if (!countries[parseInt(index, 10)]) {
      return;
    }
    const {
      phone_code: phoneCode, name, iso2: countryCode, iso3, currency, currency_symbol: currencySymbol,
    } = countries[parseInt(index, 10)];
    countryPhoneObject[countryCode] = {
      phoneCode: `${phoneCode.charAt(0) === '+' ? '' : '+'}${phoneCode}`,
      name,
      countryCode,
      iso3,
      currency,
      currencySymbol,
    };
  });
  const phoneCountryCodes: { countryCode: string, phoneCode: string, name: string, iso3: string }[] = [];
  countryCodes.forEach((countryCode) => {
    const country = countryPhoneObject[countryCode];
    if (country) {
      phoneCountryCodes.push(country);
    }
  });
  const sr = new ServiceResponse('Phone Country Codes', phoneCountryCodes, true, 200, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
