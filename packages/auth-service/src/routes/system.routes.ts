import { Router } from 'express';
import { requireRole } from '../middleware/requireUser';
import { testEndpointHandler } from '../controllers/test.controllers';
import {
  getIpGeoData, getPhoneCountryCodes, storeIpGeoData, systemPurgeUserHandler, updateIpGeoData
} from '../controllers/system.controllers';
import { ipGeoDataSchema } from '../schema/user.schema';
import { validate } from '../middleware/validateRequest';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/data/phone-country-codes', getPhoneCountryCodes);
router.get('/data/ip-geo-data/:ip', getIpGeoData);
router.post('/data/ip-geo-data', validate(ipGeoDataSchema, 'IP GeoData'), storeIpGeoData);
router.patch('/data/ip-geo-data', validate(ipGeoDataSchema, 'IP GeoData'), updateIpGeoData);
// router.delete('/manage/user/:userId', requireRole(['SYSTEM', 'ADMIN', 'SUPER_ADMIN']), systemPurgeUserHandler);
router.delete('/manage/user/:userId', systemPurgeUserHandler);

export { router as systemRoutes };
