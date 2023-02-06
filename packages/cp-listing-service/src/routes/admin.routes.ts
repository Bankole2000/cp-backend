import { Router } from 'express';
import { getAllListingsHandler, getUserListingsHandler, searchAllListingsHandler } from '../controllers/admin.controllers';
import { notYetImplementedHandler } from '../middleware/errorHandler';

const router = Router();

router.get('/listings', getAllListingsHandler); // Get all listings
router.get('/listings/search', searchAllListingsHandler); // Search listings
router.get('/users/:username/listings', getUserListingsHandler);

export { router as adminRoutes };
