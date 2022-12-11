import { Router } from 'express';
import { testEndpointHandler } from '../controllers/test.controllers';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/categories', testEndpointHandler);
router.get('/categories/:categoryId', testEndpointHandler);
router.post('/categories', testEndpointHandler);
router.patch('/categories/:categoryId', testEndpointHandler);
router.delete('/categories/:categoryId', testEndpointHandler);
router.get('/amenities', testEndpointHandler);
router.get('/amenities/:amenityId', testEndpointHandler);
router.post('/amenities', testEndpointHandler);
router.patch('/amenities/:amenityId', testEndpointHandler);
router.delete('/amenities/:amenityId', testEndpointHandler);

export { router as amenityRoutes };
