import { Router } from 'express';
import { getAllUserProfilesHandler, getResourceCountHandler } from '../controllers/admin.controllers';

const router = Router();

router.get('/users', getAllUserProfilesHandler);
router.get('/count', getResourceCountHandler);

export { router as adminRoutes };
