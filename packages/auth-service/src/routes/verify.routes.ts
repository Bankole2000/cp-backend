import { Router } from 'express';
import { testEndpointHandler } from '../controllers/test.controllers';
import {
  verifyDeviceLoginHandler,
} from '../controllers/verify.controllers';
import { validate } from '../middleware/validateRequest';
import {
  verifyDeviceLoginSchema, verifyEmailDeviceLoginSchema, verifyPhoneDeviceLoginSchema, verifyUsernameDeviceLoginSchema
} from '../schema/user.schema';

const router = Router();

router.get('/', testEndpointHandler);
router.post('/verify-device-login', validate(verifyDeviceLoginSchema, 'Device Verification'), verifyDeviceLoginHandler);
// router.post('/verify-email-device-login', validate(verifyEmailDeviceLoginSchema, 'Email Device Verification'), verifyDeviceEmailLoginHandler);
// router.post('/verify-phone-device-login', validate(verifyPhoneDeviceLoginSchema, 'Phone Device Verification'), verifyDevicePhoneLoginHandler);
// router.post('/verify-username-device-login', validate(verifyUsernameDeviceLoginSchema, 'Username'), verifyDeviceUsernameLoginHandler);

export { router as verifyRoutes };
