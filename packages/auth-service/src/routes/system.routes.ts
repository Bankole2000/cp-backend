import { Router } from 'express';
import { requireRole } from '../middleware/requireUser';
import { testEndpointHandler } from '../controllers/test.controllers';
import { getPhoneCountryCodes, systemPurgeUserHandler } from '../controllers/system.controllers';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/data/phone-country-codes', getPhoneCountryCodes);
// router.delete('/manage/user/:userId', requireRole(['SYSTEM', 'ADMIN', 'SUPER_ADMIN']), systemPurgeUserHandler);
router.delete('/manage/user/:userId', systemPurgeUserHandler);

export { router as systemRoutes };
