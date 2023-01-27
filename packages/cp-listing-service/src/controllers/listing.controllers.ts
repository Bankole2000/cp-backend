/* eslint-disable import/no-unresolved */
import {
  ServiceResponse,
} from '@cribplug/common';
// eslint-disable-next-line import/no-unresolved , @typescript-eslint/ban-ts-comment
// @ts-ignore
// import { fileFromPath } from 'formdata-node/file-from-path';
// import { FormData } from 'formdata-node';
import fs, { PathLike } from 'fs';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import { createListingFields, sanitizeData } from '../schema/listing.schema';
import { config } from '../utils/config';
import ListingDBService from '../services/listing.service';
import PBService from '../services/pb.service';
// import { fileFromPath } from 'formdata-node/lib/fileFromPath';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');

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
  listingData.createdBy = req.user.userId;
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  const pbListing = await pb.createListing(listingData);
  if (!pbListing.success) {
    await logResponse(req, pbListing);
    return res.status(pbListing.statusCode).send(pbListing);
  }
  listingData.listingId = pbListing.data.id;
  const listing = await listingService.createListing(req.user.userId, listingData);
  // TODO: delete listing from PB if listing creation fails
  await logResponse(req, listing);
  return res.status(listing.statusCode).send(listing);
};

export const addListingImageHandler = async (req: Request, res: Response) => {
  console.log({ reqBody: req.body, file: req.file });

  const form = new FormData();
  form.append('image', fs.createReadStream(req.file?.path as unknown as PathLike));
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
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
