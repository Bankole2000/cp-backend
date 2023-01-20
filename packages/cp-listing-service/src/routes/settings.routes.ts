import { Router } from 'express';
import {
  createListingTypeHandler,
  deleteListingTypeHandler,
  getListingTypesHandler,
  updateListingTypeHandler,
} from '../controllers/settings.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import { requireLoggedInUser, requireRole } from '../middleware/requireUser';
import { validate } from '../middleware/validateRequests';
import {
  deleteTypeSchema,
  listingTypeSchema, listingTypeUpdateSchema,
} from '../schema/listing.schema';
import { purposeRoutes } from './settings/purpose.routes';
import { subgroupRoutes } from './settings/subgroup.routes';

const router = Router();

router.get('/', testEndpointHandler);
router.use('/purposes', purposeRoutes);
router.use('/subgroups', subgroupRoutes);

// #region >>>: Listing Types
router.get('/types', getListingTypesHandler);
router.post('/types', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingTypeSchema, 'Listing Type'), createListingTypeHandler);
router.patch('/types/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingTypeUpdateSchema, 'Listing Type Update'), updateListingTypeHandler);
router.delete('/types/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteTypeSchema, 'Type delete'), deleteListingTypeHandler);
// #endregion

export { router as settingsRoutes };
