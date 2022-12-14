import { Router } from 'express';
import { requireRole } from '../middleware/requireUser';
import { testEndpointHandler } from '../controllers/test.controllers';
import { systemPurgeUserHandler } from '../controllers/system.controllers';

const router = Router();

router.get('/', testEndpointHandler);
router.delete('/manage/user/:userId', requireRole(['SYSTEM', 'ADMIN', 'SUPER_ADMIN']), systemPurgeUserHandler);

export { router as systemRoutes };
