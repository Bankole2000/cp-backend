import {
  ServiceResponse,
} from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import { createListingFields, sanitizeData } from '../schema/listing.schema';
import { config } from '../utils/config';
import ListingDBService from '../services/listing.service';
import PBService from '../services/pb.service';

const listingService = new ListingDBService();
const { pocketbase } = config;
const pb = new PBService(pocketbase.url || '');

export const getListingsHandler = async (req: Request, res: Response) => {
  const listings = await listingService.getAllListings();
  await logResponse(req, listings);
  return res.status(listings.statusCode).send(listings);
};

export const createListingHandler = async (req: Request, res: Response) => {
  const listingData = sanitizeData(createListingFields, req.body);
  const listing = await listingService.createListing(req.user.userId, listingData);
  if (listing.success) {
    await pb.saveAuth(req.user.pbToken, req.user.pbUser);
    const { listingId, title, caption } = listing.data;
    await pb.createListing({
      listingId, title, caption, createdBy: req.user.pbUser.id
    });
  }
  await logResponse(req, listing);
  return res.status(listing.statusCode).send(listing);
};

export const addListingImageHandler = async (req: Request, res: Response) => {
  const listing = await listingService.addListingImage(req.params.id, req.body);
  await logResponse(req, listing);
  return res.status(listing.statusCode).send(listing);
};

export const getListingDetailsHandler = async (req: Request, res: Response) => {
  const listing = await listingService.getListingDetailsById(req.params.id);
  await logResponse(req, listing);
  return res.status(listing.statusCode).json(listing);
};

export const deleteListingHandler = async (req: Request, res: Response) => {
  const listing = await listingService.deleteListing(req.params.id);
  await logResponse(req, listing);
  return res.status(listing.statusCode).send(listing);
};
