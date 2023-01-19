import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import {
  listingPurposeCreateFields, listingTypeCreateFields, listingTypeUpdateFields, purposeSubgroupCreateFields, purposeSubgroupUpdateFields, sanitizeData, stripHTML
} from '../schema/listing.schema';
import ListingDBService from '../services/listing.service';

const listingService = new ListingDBService();

export const getListingPurposesHandler = async (req: Request, res: Response) => {
  const listingPurposes = await listingService.getListingPurposes();
  return res.status(listingPurposes.statusCode).json(listingPurposes);
};

export const getListingPurposeDetailsHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const listingPurpose = await listingService.getListingPurposeDetails(purposeId);
  return res.status(listingPurpose.statusCode).json(listingPurpose);
};

export const createListingPurposeHandler = async (req: Request, res: Response) => {
  const listingPurposeData = sanitizeData(listingPurposeCreateFields, req.body);
  listingPurposeData.descriptionText = stripHTML(listingPurposeData.descriptionHTML);
  const lpExists = await listingService.getListingPurposeByKey(listingPurposeData.listingPurpose);
  if (lpExists.success) {
    const sr = new ServiceResponse('Listing purpose already exists', lpExists.data, false, 400, 'Listing purpose already exists', 'LISTING_SERVICE_PURPOSE_ALREADY_EXISTS', 'Try a different listingPurpose Key');
    return res.status(sr.statusCode).json(sr);
  }
  const lpsr = await listingService.createListingPurpose(listingPurposeData);
  if (res.locals.newAccessToken) lpsr.newAccessToken = res.locals.newAccessToken;
  return res.status(lpsr.statusCode).json(lpsr);
};

export const updateListingPurposeHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const { newkey } = req.query;
  if (newkey) {
    const keyAlreadyTaken = await listingService.getListingPurposeByKey(newkey as string);
    if (keyAlreadyTaken.success) {
      const sr = new ServiceResponse('Purpose key already exists', keyAlreadyTaken.data, false, 400, 'Listing purpose already exists', 'LISTING_SERVICE_PURPOSE_ALREADY_EXISTS', 'Try a different listingPurpose Key');
      return res.status(sr.statusCode).json(sr);
    }
  }
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const listingPurposeData = sanitizeData(listingTypeUpdateFields, req.body);
  if (listingPurposeData.descriptionHTML) listingPurposeData.descriptionText = stripHTML(listingPurposeData.descriptionHTML);
  if (newkey) listingPurposeData.listingPurpose = newkey;
  const lpsr = await listingService.updateListingPurpose(purposeId, listingPurposeData);
  if (res.locals.newAccessToken) lpsr.newAccessToken = res.locals.newAccessToken;
  return res.status(lpsr.statusCode).json(lpsr);
};

export const deleteListingPurposeHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const { _count: count } = purposeExistsSR.data;
  // TODO: Check that no listings are using this purpose
  if (count.listings) {
    const sr = new ServiceResponse('Can\'t delete purpose with listings', purposeExistsSR.data, false, 400, 'Purpose has listings', 'LISTING_SERVICE_PURPOSE_HAS_LISTINGS', 'Delete or reassign listings first');
    return res.status(sr.statusCode).json(sr);
  }
  // TODO: Check that no subgroups are using this purpose
  if (count.purposeSubgroups) {
    const sr = new ServiceResponse('Can\'t delete purpose with subgroups', purposeExistsSR.data, false, 400, 'Purpose has subgroups', 'LISTING_SERVICE_PURPOSE_HAS_SUBGROUPS', 'Delete or reassign subgroups first');
    return res.status(sr.statusCode).json(sr);
  }
  const lpsr = await listingService.deleteListingPurpose(purposeId);
  if (res.locals.newAccessToken) lpsr.newAccessToken = res.locals.newAccessToken;
  return res.status(lpsr.statusCode).json(lpsr);
};

export const getAllSubgroupsHandler = async (req: Request, res: Response) => {
  const subgroups = await listingService.getAllSubgroups();
  return res.status(subgroups.statusCode).json(subgroups);
};

export const getPurposeSubgroupsHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupsSR = await listingService.getSubgroupsByPurpose(purposeId);
  return res.status(subgroupsSR.statusCode).json(subgroupsSR);
};

export const createSubgroupHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupData = sanitizeData(purposeSubgroupCreateFields, req.body);
  const subgroupExistsSR = await listingService.getSubgroupByKey(subgroupData.purposeSubgroup);
  if (subgroupExistsSR.success) {
    const sr = new ServiceResponse('Subgroup already exists', subgroupExistsSR.data, false, 400, 'Subgroup already exists', 'LISTING_SERVICE_SUBGROUP_ALREADY_EXISTS', 'Try a different subgroup Key');
    return res.status(sr.statusCode).json(sr);
  }
  subgroupData.descriptionText = stripHTML(subgroupData.descriptionHTML);
  const subgroupSR = await listingService.createPurposeSubgroup(purposeId, subgroupData);
  if (res.locals.newAccessToken) subgroupSR.newAccessToken = res.locals.newAccessToken;
  return res.status(subgroupSR.statusCode).json(subgroupSR);
};

export const updateSubgroupHandler = async (req: Request, res: Response) => {
  const { purposeId, subgroupId } = req.params;
  const { newkey } = req.query;
  if (newkey) {
    const keyAlreadyTaken = await listingService.getSubgroupByKey(newkey as string);
    if (keyAlreadyTaken.success) {
      const sr = new ServiceResponse('Subgroup key already exists', keyAlreadyTaken.data, false, 400, 'Subgroup already exists', 'LISTING_SERVICE_SUBGROUP_ALREADY_EXISTS', 'Try a different subgroup Key');
      return res.status(sr.statusCode).json(sr);
    }
  }
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupExistsSR = await listingService.getSubgroupByKey(subgroupId);
  if (!subgroupExistsSR.success) return res.status(subgroupExistsSR.statusCode).json(subgroupExistsSR);
  if (subgroupExistsSR.data.listingPurposeKey !== purposeId) {
    const sr = new ServiceResponse('Subgroup does not belong to purpose', subgroupExistsSR.data, false, 400, 'Subgroup does not belong to purpose', 'LISTING_SERVICE_SUBGROUP_PURPOSE_MISMATCH', 'Use matching purpose and subgroup');
    return res.status(sr.statusCode).json(sr);
  }
  const subgroupData = sanitizeData(purposeSubgroupUpdateFields, req.body);
  if (subgroupData.descriptionHTML) subgroupData.descriptionText = stripHTML(subgroupData.descriptionHTML);
  if (newkey) subgroupData.purposeSubgroup = newkey;
  const subgroupSR = await listingService.updatePurposeSubgroup(subgroupId, subgroupData);
  if (res.locals.newAccessToken) subgroupSR.newAccessToken = res.locals.newAccessToken;
  return res.status(subgroupSR.statusCode).json(subgroupSR);
};

export const deleteSubgroupHandler = async (req: Request, res: Response) => {
  const { purposeId, subgroupId } = req.params;
  const purposeExistsSR = await listingService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupExistsSR = await listingService.getSubgroupByKey(subgroupId);
  if (!subgroupExistsSR.success) return res.status(subgroupExistsSR.statusCode).json(subgroupExistsSR);
  if (subgroupExistsSR.data.listingPurposeKey !== purposeId) {
    const sr = new ServiceResponse('Subgroup does not belong to purpose', subgroupExistsSR.data, false, 400, 'Subgroup does not belong to purpose', 'LISTING_SERVICE_SUBGROUP_PURPOSE_MISMATCH', 'Use matching purpose and subgroup keys');
    return res.status(sr.statusCode).json(sr);
  }
  const { _count: count } = subgroupExistsSR.data;
  if (count.listings) {
    const sr = new ServiceResponse('Subgroups with listings cannot be deleted', subgroupExistsSR.data, false, 400, 'Subgroup has listings', 'LISTING_SERVICE_SUBGROUP_HAS_LISTINGS', 'Subgroup has listings');
    return res.status(sr.statusCode).json(sr);
  }
  const delSubgroupSR = await listingService.deletePurposeSubgroup(subgroupId);
  if (res.locals.newAccessToken) delSubgroupSR.newAccessToken = res.locals.newAccessToken;
  return res.status(delSubgroupSR.statusCode).json(delSubgroupSR);
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
