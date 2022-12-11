import { Router } from 'express';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/types', testEndpointHandler);
router.get('/types/:typeId', testEndpointHandler);
router.post('/types', testEndpointHandler);
router.patch('/types/:typeId', testEndpointHandler);
router.delete('/types/:typeId', testEndpointHandler);
router.get('/purposes', testEndpointHandler);
router.get('/purposes/:purposeId', testEndpointHandler);
router.post('/purposes', testEndpointHandler);
router.patch('/purposes/:purposeId', testEndpointHandler);
router.delete('/purposes/:purposeId', testEndpointHandler);

export { router as listingRoutes };
