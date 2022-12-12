import { Router } from 'express';
import { deleteOwnAccountHandler, currentUserHandler } from '../controllers/currentUser.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import { requireLoggedInUser } from '../middleware/requireUser';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/me', currentUserHandler);
router.delete('/me', requireLoggedInUser, deleteOwnAccountHandler);

export { router as currentUserRoutes };
