import { Router } from 'express';
import {
  getListingPurposesHandler,
  getListingPurposeDetailsHandler,
  createListingPurposeHandler,
  updateListingPurposeHandler,
  deleteListingPurposeHandler,
  createSubgroupHandler,
  deleteSubgroupHandler,
  getPurposeSubgroupsHandler,
  updateSubgroupHandler
} from '../../controllers/settings/purpose.controllers';
import { requireLoggedInUser, requireRole } from '../../middleware/requireUser';
import { validate } from '../../middleware/validateRequests';
import {
  listingPurposeSchema,
  listingPurposeUpdateSchema,
  deletePurposeSchema,
  deleteSubgroupSchema,
  purposeSubgroupSchema,
  subgroupUpdateSchema
} from '../../schema/listing.schema';

const router = Router();

router.get('/', getListingPurposesHandler);
router.get('/:purposeId', getListingPurposeDetailsHandler);
router.post('/', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingPurposeSchema, 'Listing Purpose'), createListingPurposeHandler);
router.patch('/:purposeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(listingPurposeUpdateSchema, 'Purpose update'), updateListingPurposeHandler);
router.delete('/:purposeId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deletePurposeSchema, 'Delete Purpose'), deleteListingPurposeHandler);
router.get('/:purposeId/subgroups', getPurposeSubgroupsHandler);
router.post('/:purposeId/subgroups', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(purposeSubgroupSchema, 'Purpose Subgroup'), createSubgroupHandler);
router.patch('/:purposeId/subgroups/:subgroupId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(subgroupUpdateSchema, 'Subgroup update'), updateSubgroupHandler);
router.delete('/:purposeId/subgroups/:subgroupId', requireLoggedInUser, requireRole(['ADMIN', 'SUPERADMIN']), validate(deleteSubgroupSchema, 'Subgroup delete'), deleteSubgroupHandler);

export { router as purposeRoutes };
