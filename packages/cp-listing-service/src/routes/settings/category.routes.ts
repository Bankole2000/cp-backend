import { Router } from 'express';
import {
  createAmenityCategoryHandler,
  deleteAmenityCategoryHandler,
  getAllAmenityCategories,
  updateAmenityCategoryHandler
} from '../../controllers/settings/amenity.controllers';
import { requireLoggedInUser, requireRole } from '../../middleware/requireUser';
import { validate } from '../../middleware/validateRequests';
import { createCategorySchema, deleteCategorySchema, updateCategorySchema } from '../../schema/amenity.schema';

const router = Router();

router.get('/', getAllAmenityCategories);
router.post('/', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(createCategorySchema, 'Amenity Category'), createAmenityCategoryHandler);
router.patch('/:categorykey', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(updateCategorySchema, 'Category Update'), updateAmenityCategoryHandler);
router.delete('/:categorykey', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteCategorySchema, 'Category delete'), deleteAmenityCategoryHandler);

export { router as categoryRoutes };
