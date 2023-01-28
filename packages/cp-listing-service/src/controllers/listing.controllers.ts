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
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  const form = new FormData();
  form.append('image', fs.createReadStream(req.file?.path as PathLike));
  form.append('listing', req.params.listingId);
  if (!req.body.title) {
    fs.unlinkSync(req.file?.path as PathLike);
    const sr = new ServiceResponse('Image title is required', null, false, 400, 'Image title is required', 'LISTING_SERVICE_IMAGE_TITLE_REQUIRED', 'Add a title to listing image');
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  form.append('title', req.body.title);
  const { data, success } = await pb.getListingImages(req.params.listingId);
  // if (!data || !success) {
  //   form.append('order', 0);
  // } else {
  //   form.append('order', data.length);
  // }
  const pbListingImage = await pb.addListingImage(form);
  if (!pbListingImage.success) {
    await logResponse(req, pbListingImage);
    return res.status(pbListingImage.statusCode).send(pbListingImage);
  }
  const imageUrl = await pb.generateImageUrl(pbListingImage.data, pbListingImage.data.image);
  delete pbListingImage.data.expand;
  delete pbListingImage.data.collectionId;
  delete pbListingImage.data.collectionName;
  const listingImageData = {
    ...pbListingImage.data,
    order: !data || !success ? 0 : data.length,
    created: new Date(pbListingImage.data.created),
    updated: new Date(pbListingImage.data.updated),
    imageUrl
  };
  const listing = await listingService.addListingImage(listingImageData);
  if (listing.success) {
    fs.unlinkSync(req?.file?.path as PathLike);
  }
  await logResponse(req, listing);
  return res.status(listing.statusCode).send(listing);
};

export const deleteListingImageHandler = async (req: Request, res: Response) => {
  const { imageId, listingId } = req.params;
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  const { data, success } = await pb.getListingImages(listingId);
  const pbImage = await pb.deleteListingImage(imageId);
  if (!pbImage.success) {
    await logResponse(req, pbImage);
    return res.status(pbImage.statusCode).send(pbImage);
  }
  const sr = await listingService.deleteListingImage(imageId);
  if (sr.success && success) {
    if (sr.data.order < data.length - 1) {
      const ordersr = await listingService.reorderImagesBackward(sr.data.order, listingId, imageId, data.length);
      console.log({ ordersr });
    }
  }
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};

export const reorderListingImagesHandler = async (req: Request, res: Response) => {
  const { imageId, listingId } = req.params;
  const { order } = req.body;
  const list = await pb.getListingImages(listingId);
  if (!list.data || !list.success) {
    await logResponse(req, list);
    return res.status(list.statusCode).send(list);
  }
  if (order < 0 || order >= list.data.length) {
    const sr = new ServiceResponse('Invalid Ordering Number', null, false, 400, 'Invalid ordering number', 'LISTING_SERVICE_INVALID_IMAGE_ORDER', 'Check image order input');
    return res.status(sr.statusCode).send(sr);
  }
  const currentImage = await listingService.getListingImage(imageId);
  if (!currentImage.success) {
    return res.status(currentImage.statusCode).send(currentImage);
  }
  if (order === currentImage.data.order) {
    return res.status(currentImage.statusCode).send(currentImage);
  }
  const updateImage = await listingService.setImageOrder(order, imageId);
  if (updateImage.success) {
    if (order < currentImage.data.order) {
      await listingService.reorderImagesForward(order, listingId, imageId, currentImage.data.order);
    }
    if (order > currentImage.data.order) {
      await listingService.reorderImagesBackward(order, listingId, imageId, currentImage.data.order);
    }
  }
  return res.status(updateImage.statusCode).send(updateImage);
};

export const getListingDetailsHandler = async (req: Request, res: Response) => {
  const listing = await listingService.getListingDetailsById(req.params.id);
  await logResponse(req, listing);
  return res.status(listing.statusCode).json(listing);
};

export const deleteListingHandler = async (req: Request, res: Response) => {
  const { imageId } = req.params;

  const listing = await listingService.deleteListing(req.params.id);
  await logResponse(req, listing);
  return res.status(listing.statusCode).send(listing);
};
