import { Router } from 'express';
import { validate } from '../middleware/validateRequest';
import { onboardingHandler, registerWithEmailHandler, registerWithPhoneHandler } from '../controllers/register.controller';
import { testEndpointHandler } from '../controllers/test.controllers';
import { onboardingUsernameAndPasswordSchema, registerWithEmailSchema, registerWithPhoneSchema } from '../schema/user.schema';
import { requireUserFromIdToken } from '../middleware/requireUser';

const router = Router();

router.get('/', testEndpointHandler);
// Signup with email and password
router.post('/email', validate(registerWithEmailSchema, 'Registration'), registerWithEmailHandler);
// Signup with phone number
router.post('/phone', validate(registerWithPhoneSchema, 'Registration'), registerWithPhoneHandler);
// Onboarding set username and password
router.post('/onboarding/username', validate(onboardingUsernameAndPasswordSchema, 'Onboarding'), requireUserFromIdToken, onboardingHandler);
// Signup with username and password
// router.post('/email', )
// Signup with google
// Signup with facebook

export { router as registerRoutes };
