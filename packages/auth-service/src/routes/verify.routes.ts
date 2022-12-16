import { Router } from 'express';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', testEndpointHandler);

export { router as verifyRoutes };