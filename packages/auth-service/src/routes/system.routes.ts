import { Router } from 'express';
import { requireLoggedInUser } from '../middleware/requireUser';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', testEndpointHandler);

export { router as systemRoutes };
