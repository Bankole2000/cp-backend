import { Router } from 'express';
import {
  addListingImageHandler, createListingHandler, getListingDetailsHandler, getListingsHandler
} from '../controllers/listing.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import upload from '../middleware/multerUpload';
import { requireLoggedInUser } from '../middleware/requireUser';
import { checkUserOwnsListing } from '../middleware/userOwnsResource';
import { validate } from '../middleware/validateRequests';
import { createListingSchema } from '../schema/listing.schema';

const router = Router();

router.get('/', getListingsHandler);
router.post('/', requireLoggedInUser, validate(createListingSchema, 'Create Listing'), createListingHandler);
router.get('/:listingId', getListingDetailsHandler);
router.post('/:listingId/images', requireLoggedInUser, checkUserOwnsListing, upload.single('image'), addListingImageHandler);
router.get('/types', testEndpointHandler);
router.get('/types/:typeId', testEndpointHandler);
router.post('/types', testEndpointHandler);
router.patch('/types/:typeId', testEndpointHandler);
router.delete('/types/:typeId', testEndpointHandler);
router.get('/purposes', testEndpointHandler);
router.get('/purposes/:purposeId', testEndpointHandler);
router.post('/purposes', testEndpointHandler);
router.patch('/purposes/:purposeId', testEndpointHandler);
router.delete('/purposes/:purposeId', testEndpointHandler);

export { router as listingRoutes };
