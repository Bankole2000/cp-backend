import { Router } from 'express';
import { currentUserHandler } from '../controllers/login.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/me', currentUserHandler);

export { router as currentUserRoutes };
