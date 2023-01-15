import { Router } from 'express';
import {
  createListingPurposeHandler, createListingTypeHandler, deleteListingPurposeHandler, deleteListingTypeHandler, getListingPurposesHandler, getListingTypesHandler, updateListingPurposeHandler, updateListingTypeHandler
} from '../controllers/settings.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import { requireLoggedInUser, requireRole } from '../middleware/requireUser';
import { validate } from '../middleware/validateRequests';
import { listingPurposeSchema, listingTypeSchema } from '../schema/listing.schema';

const router = Router();

router.get('/', testEndpointHandler);
router.get('/purposes', getListingPurposesHandler);
router.post('/purposes', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingPurposeSchema, 'Listing Purpose'), createListingPurposeHandler);
router.patch('/purposes/:purposeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), updateListingPurposeHandler);
router.delete('/purposes/:purposeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), deleteListingPurposeHandler);
router.get('/types', getListingTypesHandler);
router.post('/types', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingTypeSchema, 'Listing Type'), createListingTypeHandler);
router.patch('/types/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), updateListingTypeHandler);
router.delete('/types/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), deleteListingTypeHandler);

export { router as settingsRoutes };
