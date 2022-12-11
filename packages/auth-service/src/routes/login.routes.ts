import { validate } from '@cribplug/common';
import { Router } from 'express';
import { emailLoginHandler, usernameLoginHandler } from '../controllers/login.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import { emailLoginSchema } from '../schema/user.schema';

const router = Router();

router.get('/', testEndpointHandler);
router.post('/email', validate(emailLoginSchema, 'Email Login'), emailLoginHandler);
router.post('/username', usernameLoginHandler);

export { router as loginRoutes };
