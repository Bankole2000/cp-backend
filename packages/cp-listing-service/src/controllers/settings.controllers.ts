import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import {
  listingPurposeCreateFields, listingTypeCreateFields, listingTypeUpdateFields, sanitizeData
} from '../schema/listing.schema';
import ListingDBService from '../services/listing.service';

const listingService = new ListingDBService();

export const getListingPurposesHandler = async (req: Request, res: Response) => {
  const listingPurposes = await listingService.getListingPurposes();
  return res.status(listingPurposes.statusCode).json(listingPurposes);
};

export const createListingPurposeHandler = async (req: Request, res: Response) => {
  const listingPurposeData = sanitizeData(listingPurposeCreateFields, req.body);
  const lpsr = await listingService.createListingPurpose(listingPurposeData);
  return res.status(lpsr.statusCode).json(lpsr);
};

export const updateListingPurposeHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const listingPurposeData = sanitizeData(listingTypeUpdateFields, req.body);
  const lpsr = await listingService.updateListingPurpose(purposeId, listingPurposeData);
  return res.status(lpsr.statusCode).json(lpsr);
};

export const deleteListingPurposeHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const lpsr = await listingService.deleteListingPurpose(purposeId);
  return res.status(lpsr.statusCode).json(lpsr);
};

export const getListingTypesHandler = async (req: Request, res: Response) => {
  const listingTypes = await listingService.getListingTypes();
  return res.status(listingTypes.statusCode).json(listingTypes);
};

export const createListingTypeHandler = async (req: Request, res: Response) => {
  const listingTypeData = sanitizeData(listingTypeCreateFields, req.body);
  const ltsr = await listingService.createListingType(listingTypeData);
  return res.status(ltsr.statusCode).json(ltsr);
};

export const updateListingTypeHandler = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  const typeExistsSR = await listingService.getListingTypeByKey(typeId);
  if (!typeExistsSR.success) return res.status(typeExistsSR.statusCode).json(typeExistsSR);
  const listingTypeData = sanitizeData(listingTypeUpdateFields, req.body);
  const ltsr = await listingService.updateListingType(typeId, listingTypeData);
  return res.status(ltsr.statusCode).json(ltsr);
};

export const deleteListingTypeHandler = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  const typeExistsSR = await listingService.getListingTypeByKey(typeId);
  if (!typeExistsSR.success) return res.status(typeExistsSR.statusCode).json(typeExistsSR);
  const ltsr = await listingService.deleteListingType(typeId);
  return res.status(ltsr.statusCode).json(ltsr);
};
