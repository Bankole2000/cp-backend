import { Router } from 'express';
import { testEndpointHandler } from '../controllers/test.controllers';
import {
  forgotPasswordHandler,
  resendOTPHandler,
  verifyDeviceLoginHandler, verifyOTPHandler,
} from '../controllers/verify.controllers';
import { requireUserFromIdToken } from '../middleware/requireUser';
import { validate } from '../middleware/validateRequest';
import {
  forgotPasswordSchema,
  sendOTPSchema,
  verifyDeviceLoginSchema, verifyEmailDeviceLoginSchema, verifyOTPSchema, verifyPhoneDeviceLoginSchema, verifyUsernameDeviceLoginSchema
} from '../schema/user.schema';

const router = Router();

router.get('/', testEndpointHandler);
router.post('/verify-device-login', validate(verifyDeviceLoginSchema, 'Device Verification'), verifyDeviceLoginHandler);
router.post('/otp/verify', requireUserFromIdToken, validate(verifyOTPSchema, 'OTP Verification'), verifyOTPHandler);
router.post('/otp/resend', requireUserFromIdToken, validate(sendOTPSchema, 'Send OTP'), resendOTPHandler);
router.post('/forgot-password', validate(forgotPasswordSchema, 'Forgot Password Request'), forgotPasswordHandler);
// router.post('/verify-email-device-login', validate(verifyEmailDeviceLoginSchema, 'Email Device Verification'), verifyDeviceEmailLoginHandler);
// router.post('/verify-phone-device-login', validate(verifyPhoneDeviceLoginSchema, 'Phone Device Verification'), verifyDevicePhoneLoginHandler);
// router.post('/verify-username-device-login', validate(verifyUsernameDeviceLoginSchema, 'Username'), verifyDeviceUsernameLoginHandler);

export { router as verifyRoutes };
