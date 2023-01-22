import { Router } from 'express';
import { testEndpointHandler } from '../controllers/test.controllers';
import { amenityRoutes } from './settings/amenity.routes';
import { categoryRoutes } from './settings/category.routes';
import { purposeRoutes } from './settings/purpose.routes';
import { subgroupRoutes } from './settings/subgroup.routes';
import { listingTypeRoutes } from './settings/listingType.routes';
import { houseRulesRoutes } from './settings/houseRules.routes';

const router = Router();

router.get('/', testEndpointHandler);
router.use('/purposes', purposeRoutes);
router.use('/subgroups', subgroupRoutes);
router.use('/amenities', amenityRoutes);
router.use('/amenity-categories', categoryRoutes);
router.use('/listing-types', listingTypeRoutes);
router.use('/house-rules', houseRulesRoutes);

export { router as settingsRoutes };
