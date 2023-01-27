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
  const { createdByUserId } = listingExists.data;
  if (createdByUserId !== user.userId) {
    const sr = new ServiceResponse('You do not have permission to perform this action', null, false, 403, 'Forbidden', 'LISTING_SERVICE_USER_NOT_AUTHORIZED', 'You do not have permission to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  return next();
};
