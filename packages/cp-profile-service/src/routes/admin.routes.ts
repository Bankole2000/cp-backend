import { Router } from 'express';
import { getAllUserProfilesHandler } from '../controllers/admin.controllers';

const router = Router();

router.get('/users', getAllUserProfilesHandler);

export { router as adminRoutes };
