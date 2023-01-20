import { Request, Response } from 'express';
import {
  listingTypeCreateFields, listingTypeUpdateFields, sanitizeData,
} from '../schema/listing.schema';
import ListingDBService from '../services/listing.service';

const listingService = new ListingDBService();

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
