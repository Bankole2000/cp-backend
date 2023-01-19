import { Router } from 'express';
import {
  createListingPurposeHandler,
  createListingTypeHandler,
  createSubgroupHandler,
  deleteListingPurposeHandler,
  deleteListingTypeHandler,
  deleteSubgroupHandler,
  getAllSubgroupsHandler,
  getListingPurposeDetailsHandler,
  getListingPurposesHandler,
  getListingTypesHandler,
  getPurposeSubgroupsHandler,
  updateListingPurposeHandler,
  updateListingTypeHandler,
  updateSubgroupHandler
} from '../controllers/settings.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import { requireLoggedInUser, requireRole } from '../middleware/requireUser';
import { validate } from '../middleware/validateRequests';
import {
  deletePurposeSchema,
  deleteSubgroupSchema,
  deleteTypeSchema,
  listingPurposeSchema, listingPurposeUpdateSchema, listingTypeSchema, listingTypeUpdateSchema, purposeSubgroupSchema, subgroupUpdateSchema
} from '../schema/listing.schema';

const router = Router();

router.get('/', testEndpointHandler);

// #region >>>: Listing Purposes
router.get('/purposes', getListingPurposesHandler);
router.get('/purposes/:purposeId', getListingPurposeDetailsHandler);
router.post('/purposes', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingPurposeSchema, 'Listing Purpose'), createListingPurposeHandler);
router.patch('/purposes/:purposeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingPurposeUpdateSchema, 'Purpose update'), updateListingPurposeHandler);
router.delete('/purposes/:purposeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deletePurposeSchema, 'Delete Purpose'), deleteListingPurposeHandler);
// #endregion

// #region >>>: Purpose Subgroups
router.get('/subgroups', getAllSubgroupsHandler);
router.get('/purposes/:purposeId/subgroups', getPurposeSubgroupsHandler);
router.post('/purposes/:purposeId/subgroups', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(purposeSubgroupSchema, 'Purpose Subgroup'), createSubgroupHandler);
router.patch('/purposes/:purposeId/subgroups/:subgroupId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(subgroupUpdateSchema, 'Subgroup update'), updateSubgroupHandler);
router.delete('/purposes/:purposeId/subgroups/:subgroupId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteSubgroupSchema, 'Subgroup delete'), deleteSubgroupHandler);
// #endregion

// #region >>>: Listing Types
router.get('/types', getListingTypesHandler);
router.post('/types', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingTypeSchema, 'Listing Type'), createListingTypeHandler);
router.patch('/types/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingTypeUpdateSchema, 'Listing Type Update'), updateListingTypeHandler);
router.delete('/types/:typeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteTypeSchema, 'Type delete'), deleteListingTypeHandler);
// #endregion

export { router as settingsRoutes };
