import { Router } from 'express';
import {
  createListingTypeHandler,
  deleteListingTypeHandler,
  getListingTypesHandler,
  updateListingTypeHandler
} from '../../controllers/settings/listingType.controllers';
import { requireLoggedInUser, requireRole } from '../../middleware/requireUser';
import { validate } from '../../middleware/validateRequests';
import { createListingTypeSchema, deleteListingTypeSchema, updateListingTypeSchema } from '../../schema/listingType.schema';
import { clearFromCache, getFromCache } from '../../middleware/cacheRequests';

const router = Router();

router.get('/', getFromCache, getListingTypesHandler);
router.post('/', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(createListingTypeSchema, 'Create Listing Type'), clearFromCache, createListingTypeHandler);
router.patch('/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(updateListingTypeSchema, 'Update Listing Type'), updateListingTypeHandler);
router.delete('/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteListingTypeSchema, 'Delete Listing Type'), deleteListingTypeHandler);

export { router as listingTypeRoutes };
