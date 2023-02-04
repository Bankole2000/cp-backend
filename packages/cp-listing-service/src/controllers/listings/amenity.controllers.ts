import { Request, Response } from 'express';
import { listingAmenityFieldsList, sanitizeData } from '../../schema/listing.schema';
import AmenityDBService from '../../services/amenity.service';
import ListingDBService from '../../services/listing.service';

const amenityService = new AmenityDBService();
const listingService = new ListingDBService();

export const addListingAmenityHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const amenityData = sanitizeData(listingAmenityFieldsList, req.body);
  const lhaSR = await amenityService.listingHasAmenity(listingId, amenityData.amenity);
  if (lhaSR.success) {
    const newLA = await amenityService
      .updateListingAmenity(listingId, amenityData.amenity, amenityData);
    return res.status(newLA.statusCode).send(newLA);
  }
  const sr = await amenityService.addAmenityToListing(listingId, amenityData);
  return res.status(sr.statusCode).send(sr);
};

export const addMultipleListingAmenityHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  await amenityService.removeAllListingAmenities(listingId);
  const sr = await amenityService.addMultipleListingAmenities(listingId, req.body.amenities);
  console.log({ data: req.body });
  return res.status(sr.statusCode).send(sr);
};

export const updateListingAmenityHandler = async (req: Request, res: Response) => {
  const { listingId, amenity } = req.params;
  const { description } = req.body;
  const amenityData = {
    description,
  };
  const lhaSR = await amenityService.listingHasAmenity(listingId, amenity);
  if (lhaSR.success) {
    const newLA = await amenityService
      .updateListingAmenity(listingId, amenity, amenityData);
    return res.status(newLA.statusCode).send(newLA);
  }
  return res.status(lhaSR.statusCode).send(lhaSR);
};

export const removeListingAmenityHandler = async (req: Request, res: Response) => {
  const { listingId, amenity } = req.params;
  const lhaSR = await amenityService.listingHasAmenity(listingId, amenity);
  if (!lhaSR.success) {
    return res.status(lhaSR.statusCode).send(lhaSR);
  }
  const sr = await amenityService.removeListingAmenity(listingId, amenity);
  return res.status(sr.statusCode).send(sr);
};

export const removeAllListingAmenitiesHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const sr = await amenityService.removeAllListingAmenities(listingId);
  return res.status(sr.statusCode).send(sr);
};

export const getListingAmenitiesHandler = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  console.log({ listingId });
  const lExists = await listingService.getListingById(listingId);
  if (!lExists.success) {
    return res.status(lExists.statusCode).send(lExists);
  }
  const amenities = await amenityService.getListingAmenities(listingId);
  return res.status(amenities.statusCode).send(amenities);
};
