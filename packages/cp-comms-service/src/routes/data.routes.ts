import { Router } from 'express';
import { getModelData, getServiceDataSchema } from '../controllers/data.controllers';

const router = Router();

router.get('/', getServiceDataSchema);
router.get('/:model', getModelData);

export { router as dataRoutes };
