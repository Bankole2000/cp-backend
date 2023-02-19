import { Router } from 'express';
import {
  deleteOwnAccountHandler, currentUserHandler, getUserDevicesHandler, deleteUserDeviceHandler
} from '../controllers/currentUser.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/me', currentUserHandler);
router.delete('/me', deleteOwnAccountHandler);
router.get('/devices', getUserDevicesHandler);
router.delete('/devices/:deviceId', deleteUserDeviceHandler);

export { router as currentUserRoutes };
