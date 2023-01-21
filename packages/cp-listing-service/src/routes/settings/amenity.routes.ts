import { Router } from 'express';
import { getAllAmenitiesHandler } from '../../controllers/settings/amenity.controllers';
import { getFromCache } from '../../middleware/cacheRequests';
// import { requireLoggedInUser } from '../../middleware/requireUser';
// import { requireRole } from '../../middleware/requireUser';

const router = Router();

router.get('/', getFromCache, getAllAmenitiesHandler);
// router.post('/', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), createAmenityHandler);

export { router as amenityRoutes };
