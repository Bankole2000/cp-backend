import { Request, Response, NextFunction } from 'express';
import { ServiceResponse } from '@cribplug/common';
import UserDBService from '../services/user.service';
import ListingDBService from '../services/listing.service';

const userService = new UserDBService();
const listingService = new ListingDBService();

export const checkUserOwnsListing = async (req: Request, res: Response, next: NextFunction) => {
  const { user } = req;
  const { listingId } = req.params;
  const listingExists = await listingService.getListingById(listingId);
  if (!listingExists.success) {
    return res.status(listingExists.statusCode).send(listingExists);
  }
  const { createdBy } = listingExists.data;
  if (createdBy !== user.userId) {
    const sr = new ServiceResponse('You do not have permission to perform this action', null, false, 403, 'Forbidden', 'LISTING_SERVICE_USER_NOT_AUTHORIZED', 'You do not have permission to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};

export const checkListingHasImage = async (req: Request, res: Response, next: NextFunction) => {
  const { listingId, imageId } = req.params;
  const sr = await listingService.getListingImage(imageId);
  if (!sr.success) {
    return res.status(sr.statusCode).send(sr);
  }
  if (sr.data.listing !== listingId) {
    const err = new ServiceResponse('Image is not for listing', null, false, 401, 'Image is not for listing', 'LISTING_SERVICE_IMAGE_NOT_FOR_LISTING', 'Check image Id and listing id');
    return res.status(err.statusCode).send(err);
  }
  return next();
};
