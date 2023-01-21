import { Router } from 'express';
import {
  createAmenityCategoryHandler,
  createAmenityHandler,
  deleteAmenityCategoryHandler,
  deleteAmenityHandler,
  getAllAmenityCategoriesHandler,
  getCategoryAmenitiesHandler,
  updateAmenityCategoryHandler,
  updateAmenityHandler
} from '../../controllers/settings/amenity.controllers';
import { clearFromCache, getFromCache } from '../../middleware/cacheRequests';
import { requireLoggedInUser, requireRole } from '../../middleware/requireUser';
import { validate } from '../../middleware/validateRequests';
import {
  createAmenitySchema,
  createCategorySchema,
  deleteAmenitySchema,
  deleteCategorySchema,
  updateAmenitySchema,
  updateCategorySchema
} from '../../schema/amenity.schema';

const router = Router();

router.get('/', getFromCache, getAllAmenityCategoriesHandler);
router.post('/', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(createCategorySchema, 'Amenity Category'), clearFromCache, createAmenityCategoryHandler);
router.patch('/:categorykey', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(updateCategorySchema, 'Category Update'), updateAmenityCategoryHandler);
router.delete('/:categorykey', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteCategorySchema, 'Category delete'), deleteAmenityCategoryHandler);
router.get('/:categorykey/amenities', getFromCache, getCategoryAmenitiesHandler);
router.post('/:categorykey/amenities', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(createAmenitySchema, 'Amenity Create'), clearFromCache, createAmenityHandler);
router.patch('/:categorykey/amenities/:amenitykey', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(updateAmenitySchema, 'Amenity Update'), updateAmenityHandler);
router.delete('/:categorykey/amenities/:amenitykey', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteAmenitySchema, 'Amenity Delete'), deleteAmenityHandler);

export { router as categoryRoutes };
