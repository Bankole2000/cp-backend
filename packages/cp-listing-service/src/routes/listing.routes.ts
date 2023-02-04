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
import {
  addListingAmenityHandler,
  getListingAmenitiesHandler,
  removeListingAmenityHandler,
  updateListingAmenityHandler,
  addMultipleListingAmenityHandler,
  removeAllListingAmenitiesHandler
} from '../controllers/listings/amenity.controllers';
import {
  addListingHouseRuleHandler,
  addMultipleListingHouseRulesHandler,
  getListingHouseRulesHandler,
  removeAllListingHouseRulesHandler,
  removeListingHouseRuleHandler,
  updateListingHouseRuleHandler
} from '../controllers/listings/houseRules.controllers';
import { testEndpointHandler } from '../controllers/test.controllers';
import upload from '../middleware/multerUpload';
import { requireLoggedInUser } from '../middleware/requireUser';
import { checkListingHasImage, checkUserOwnsListing } from '../middleware/userOwnsResource';
import { validate } from '../middleware/validateRequests';
import {
  addAmenityToListingSchema,
  createListingSchema,
  setListingTypeSchema,
  mutateListingAmenitySchema,
  addMultipleListingAmenitiesSchema,
  addHouseRuleToListingSchema,
  setMultipleListingHouseRulesSchema,
  mutateListingHouseRuleSchema,
  listingIdSchema
} from '../schema/listing.schema';

const router = Router();

router.get('/', getListingsHandler);
router.post('/', requireLoggedInUser, validate(createListingSchema, 'Create Listing'), createListingHandler);
router.get('/:listingId', getListingDetailsHandler);
router.patch('/:listingId/type', requireLoggedInUser, checkUserOwnsListing, validate(setListingTypeSchema, 'Listing Type'), setListingTypeHandler);
router.post('/:listingId/images', requireLoggedInUser, checkUserOwnsListing, upload.single('image'), addListingImageHandler);
router.delete('/:listingId/images/:imageId', requireLoggedInUser, checkUserOwnsListing, checkListingHasImage, deleteListingImageHandler);
router.patch('/:listingId/images/:imageId', requireLoggedInUser, checkUserOwnsListing, checkListingHasImage, reorderListingImagesHandler);
router.get('/:listingId/amenities', validate(listingIdSchema, 'Listing Id'), getListingAmenitiesHandler);
router.post('/:listingId/amenity', requireLoggedInUser, checkUserOwnsListing, validate(addAmenityToListingSchema, 'Add Listing Amenity'), addListingAmenityHandler);
router.post('/:listingId/amenities', requireLoggedInUser, checkUserOwnsListing, validate(addMultipleListingAmenitiesSchema, 'Add Multiple Listing Amenities'), addMultipleListingAmenityHandler);
router.patch('/:listingId/amenities/:amenity', requireLoggedInUser, checkUserOwnsListing, validate(mutateListingAmenitySchema, 'Update Listing Amenity'), updateListingAmenityHandler);
router.delete('/:listingId/amenities/:amenity', requireLoggedInUser, checkUserOwnsListing, validate(mutateListingAmenitySchema, 'Remove Listing Amenity'), removeListingAmenityHandler);
router.delete('/:listingId/amenities', requireLoggedInUser, checkUserOwnsListing, removeAllListingAmenitiesHandler);
router.get('/:listingId/house-rules', validate(listingIdSchema, 'Listing Id'), getListingHouseRulesHandler);
router.post('/:listingId/house-rule', requireLoggedInUser, checkUserOwnsListing, validate(addHouseRuleToListingSchema, 'Add House Rule'), addListingHouseRuleHandler);
router.post('/:listingId/house-rules', requireLoggedInUser, checkUserOwnsListing, validate(setMultipleListingHouseRulesSchema, 'Set House Rules'), addMultipleListingHouseRulesHandler);
router.patch('/:listingId/house-rules/:houseRule', requireLoggedInUser, checkUserOwnsListing, validate(mutateListingHouseRuleSchema, 'Update Listing House Rule'), updateListingHouseRuleHandler);
router.delete('/:listingId/house-rules/:houseRule', requireLoggedInUser, checkUserOwnsListing, validate(mutateListingHouseRuleSchema, 'Remove Listing House Rule'), removeListingHouseRuleHandler);
router.delete('/:listingId/house-rules', requireLoggedInUser, checkUserOwnsListing, removeAllListingHouseRulesHandler);
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
