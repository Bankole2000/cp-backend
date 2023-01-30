import { Router } from 'express';
import {
  addListingImageHandler,
  createListingHandler,
  deleteListingImageHandler,
  getListingDetailsHandler,
  getListingsHandler,
  reorderListingImagesHandler,
  setListingTypeHandler
} from '../controllers/listing.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import upload from '../middleware/multerUpload';
import { requireLoggedInUser } from '../middleware/requireUser';
import { checkListingHasImage, checkUserOwnsListing } from '../middleware/userOwnsResource';
import { validate } from '../middleware/validateRequests';
import { createListingSchema, setListingTypeSchema } from '../schema/listing.schema';

const router = Router();

router.get('/', getListingsHandler);
router.post('/', requireLoggedInUser, validate(createListingSchema, 'Create Listing'), createListingHandler);
router.get('/:listingId', getListingDetailsHandler);
router.patch('/:listingId/type', requireLoggedInUser, checkUserOwnsListing, validate(setListingTypeSchema, 'Listing Type'), setListingTypeHandler);
router.post('/:listingId/images', requireLoggedInUser, checkUserOwnsListing, upload.single('image'), addListingImageHandler);
router.delete('/:listingId/images/:imageId', requireLoggedInUser, checkUserOwnsListing, checkListingHasImage, deleteListingImageHandler);
router.patch('/:listingId/images/:imageId', requireLoggedInUser, checkUserOwnsListing, checkListingHasImage, reorderListingImagesHandler);
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
