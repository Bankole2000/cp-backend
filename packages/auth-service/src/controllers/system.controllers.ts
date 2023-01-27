import { ServiceEvent, ServiceResponse, countries } from '@cribplug/common';
import { getCountries } from 'libphonenumber-js';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import { getServiceQueues, sendToServiceQueues } from '../services/events.service';
import UserDBService from '../services/user.service';
import PBService from '../services/pb.service';
import { config } from '../utils/config';

const { self, redisConfig, pocketbase } = config;
const userService = new UserDBService();
const pb = new PBService(pocketbase.url as string);

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
    const pbUser = await pb.findUserById(userId);
    if (!pbUser.success) {
      return res.status(pbUser.statusCode).send(pbUser);
    }
    await pb.authenticateAdmin(pocketbase.adminEmail || '', pocketbase.adminPassword || '');
    await pb.deleteUser(pbUser.data.id);
  }
  await logResponse(req, purgeUserSR);
  return res.status(purgeUserSR.statusCode).send(purgeUserSR);
};

export const getPhoneCountryCodes = async (req: Request, res: Response) => {
  const countryCodes = getCountries();
  const countryPhoneObject: { [key: string]: any } = {};
  // const indices = Object.keys(countries);
  countries.forEach((country) => {
    // if (!countries[parseInt(index, 10)]) {
    //   return;
    // }
    const {
      phone_code: phoneCode, name, iso2: countryCode, iso3, currency, currency_symbol: currencySymbol,
    } = country;
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

export const getIpGeoData = async (req: Request, res: Response) => {
  console.log('fetching IP Geo Data');
  const { ip } = req.params;
  const sr = await userService.getIpGeoData(ip);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const storeIpGeoData = async (req: Request, res: Response) => {
  console.log('storing IP Geo Data');
  const { ip, geoData } = req.body;
  const ipExistsSR = await userService.getIpGeoData(ip);
  if (ipExistsSR.success) {
    const updateSr = await userService.updateIpGeoData(ip, geoData);
    await logResponse(req, updateSr);
    return res.status(updateSr.statusCode).send(updateSr);
  }
  const sr = await userService.storeIpGeoData(ip, geoData);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const updateIpGeoData = async (req: Request, res: Response) => {
  const { ip, geoData } = req.body;
  const ipExistsSR = await userService.getIpGeoData(ip);
  if (ipExistsSR.success) {
    const updateSr = await userService.updateIpGeoData(ip, geoData);
    await logResponse(req, updateSr);
    return res.status(updateSr.statusCode).send(updateSr);
  }
  const sr = await userService.storeIpGeoData(ip, geoData);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
