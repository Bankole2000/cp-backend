import { Router } from 'express';
import { validate } from '../middleware/validateRequest';
import { registerWithEmail, onboardingHandler } from '../controllers/register.controller';
import { testEndpointHandler } from '../controllers/test.controllers';
import { onboardingUsernameAndPasswordSchema, registerWithEmailSchema } from '../schema/user.schema';
import { requireUserFromIdToken } from '../middleware/requireUser';

const router = Router();

router.get('/', testEndpointHandler);
// Signup with email and password
router.post('/email', validate(registerWithEmailSchema, 'Registration'), registerWithEmail);
// Onboarding set username and password
router.post('/onboarding/username', validate(onboardingUsernameAndPasswordSchema, 'Onboarding'), requireUserFromIdToken, onboardingHandler);
// Signup with username and password
// router.post('/email', )
// Signup with phone number and password
// router.post('/email', )
// Signup with google
// Signup with facebook

export { router as registerRoutes };
