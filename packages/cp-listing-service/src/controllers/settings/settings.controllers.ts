import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import AmenityDBService from '../../services/amenity.service';
import { setCache } from '../../services/cache.service';
import HouseRulesDBService from '../../services/houseRules.service';
import ListingTypeDBService from '../../services/listingType.service';
import ListingPurposeDBService from '../../services/purpose.service';

const amenityService = new AmenityDBService();
const houseRulesService = new HouseRulesDBService();
const listingTypeService = new ListingTypeDBService();
const purposeService = new ListingPurposeDBService();

export const getAllListingSettings = async (req: Request, res: Response) => {
  const listingTypes = (await listingTypeService.getListingTypes()).data;
  const listingPurposes = (await purposeService.getListingPurposes()).data;
  const amenities = (await amenityService.getAllAmenities()).data;
  const houseRules = (await houseRulesService.getHouseRules()).data;
  const subgroups = (await purposeService.getAllSubgroups()).data;
  await setCache(req.redis, req.originalUrl, {
    listingTypes, listingPurposes, amenities, houseRules, subgroups
  });
  const sr = new ServiceResponse('Listing settings', {
    listingTypes, listingPurposes, amenities, houseRules, subgroups
  }, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};
