import { Router } from 'express';
import { getAllSubgroupsHandler } from '../../controllers/settings/purpose.controllers';

const router = Router();

router.get('/', getAllSubgroupsHandler);

export { router as subgroupRoutes };
