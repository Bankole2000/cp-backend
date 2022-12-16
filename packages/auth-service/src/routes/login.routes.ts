import { validate } from '@cribplug/common';
import { Router } from 'express';
import { emailLoginHandler, phoneLoginHandler, usernameLoginHandler } from '../controllers/login.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import { emailLoginSchema, phoneLoginSchema } from '../schema/user.schema';

const router = Router();

router.get('/', testEndpointHandler);
router.post('/email', validate(emailLoginSchema, 'Email Login'), emailLoginHandler);
router.post('/phone', validate(phoneLoginSchema, 'Phone Login'), phoneLoginHandler);
router.post('/username', usernameLoginHandler);

export { router as loginRoutes };
