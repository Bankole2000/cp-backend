import { Router } from 'express';
import { getAllAmenitiesHandler } from '../../controllers/settings/amenity.controllers';
import { requireLoggedInUser } from '../../middleware/requireUser';
import { requireRole } from '../../middleware/requireUser';

const router = Router();

router.get('/', getAllAmenitiesHandler);
// router.post('/', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), createAmenityHandler);

export { router as amenityRoutes };
