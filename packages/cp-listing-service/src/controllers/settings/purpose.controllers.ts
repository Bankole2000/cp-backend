import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import { db } from '../../lib/lokijs';
import { config } from '../../utils/config';
import {
  sanitizeData,
  stripHTML
} from '../../schema/listing.schema';
import {
  listingPurposeCreateFields,
  listingTypeUpdateFields,
  purposeSubgroupCreateFields,
  purposeSubgroupUpdateFields,
} from '../../schema/purpose.schema';
import { deleteCache, setCache } from '../../services/cache.service';
import ListingPurposeDBService from '../../services/purpose.service';
import PBService from '../../services/pb.service';

const { self: { basePath }, pocketbase } = config;
const pb = new PBService(pocketbase.url as string);
const purposeService = new ListingPurposeDBService();

export const getListingPurposesHandler = async (req: Request, res: Response) => {
  const listingPurposes = await purposeService.getListingPurposes();
  await setCache(req.redis, req.originalUrl, listingPurposes);
  return res.status(listingPurposes.statusCode).json(listingPurposes);
};

export const getListingPurposeDetailsHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const listingPurpose = await purposeService.getListingPurposeDetails(purposeId);
  await setCache(req.redis, req.originalUrl, listingPurpose);
  return res.status(listingPurpose.statusCode).json(listingPurpose);
};

export const createListingPurposeHandler = async (req: Request, res: Response) => {
  const listingPurposeData = sanitizeData(listingPurposeCreateFields, req.body);
  listingPurposeData.descriptionText = stripHTML(listingPurposeData.descriptionHTML);
  const lpExists = await purposeService.getListingPurposeByKey(listingPurposeData.listingPurpose);
  if (lpExists.success) {
    const sr = new ServiceResponse('Listing purpose already exists', lpExists.data, false, 400, 'Listing purpose already exists', 'LISTING_SERVICE_PURPOSE_ALREADY_EXISTS', 'Try a different listingPurpose Key');
    return res.status(sr.statusCode).json(sr);
  }
  const lpsr = await purposeService.createListingPurpose(listingPurposeData);
  if (lpsr.success) {
    db.getCollection('purposes').insert(lpsr.data);
    db.saveDatabase();
  }
  if (res.locals.newAccessToken) lpsr.newAccessToken = res.locals.newAccessToken;
  return res.status(lpsr.statusCode).json(lpsr);
};

export const updateListingPurposeHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const { newkey } = req.query;
  if (newkey) {
    const keyAlreadyTaken = await purposeService.getListingPurposeByKey(newkey as string);
    if (keyAlreadyTaken.success) {
      const sr = new ServiceResponse('Purpose key already exists', keyAlreadyTaken.data, false, 400, 'Listing purpose already exists', 'LISTING_SERVICE_PURPOSE_ALREADY_EXISTS', 'Try a different listingPurpose Key');
      return res.status(sr.statusCode).json(sr);
    }
  }
  const purposeExistsSR = await purposeService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const listingPurposeData = sanitizeData(listingTypeUpdateFields, req.body);
  if (listingPurposeData.descriptionHTML) {
    listingPurposeData.descriptionText = stripHTML(listingPurposeData.descriptionHTML);
  }
  if (newkey) listingPurposeData.listingPurpose = newkey;
  const lpsr = await purposeService.updateListingPurpose(purposeId, listingPurposeData);
  if (lpsr.success) {
    const { _count: count } = lpsr.data;
    if (newkey && count.listings) {
      const affectedListings = (await purposeService
        .getListingIdsWherePurpose(newkey as string)).data;
      if (affectedListings) {
        await pb.saveAuth(req.user.pbToken, req.user.pbUser);
        const result = await pb.updateRecordsInParallel('listings', affectedListings.map((x: { listingId: any; }) => x.listingId), { listingPurpose: newkey });
        console.log({ result });
      }
    }
    const purposes = db.getCollection('purposes');
    let purpose = purposes.findOne({ listingPurpose: purposeId });
    purpose = { ...purpose, ...lpsr.data };
    purposes.update(purpose);
    if (newkey) {
      const purposeSubgroups = db.getCollection('subgroups').find({ listingPurpose: purposeId });
      purposeSubgroups.forEach((subgroup) => {
        // eslint-disable-next-line no-param-reassign
        subgroup.listingPurpose = newkey;
        db.getCollection('subgroups').update(subgroup);
      });
    }
    db.saveDatabase();
    await deleteCache(req.redis, [req.originalUrl, `${basePath}/settings/purposes`, `${basePath}/settings/`]);
  }
  if (res.locals.newAccessToken) lpsr.newAccessToken = res.locals.newAccessToken;
  return res.status(lpsr.statusCode).json(lpsr);
};

export const deleteListingPurposeHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await purposeService.getListingPurposeByKey(purposeId);
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
  const lpsr = await purposeService.deleteListingPurpose(purposeId);
  if (lpsr.success) {
    const purposes = db.getCollection('purposes');
    const purpose = purposes.findOne({ listingPurpose: purposeId });
    purposes.remove(purpose);
    db.saveDatabase();
    await deleteCache(req.redis, [req.originalUrl, `${basePath}/settings/purposes`, `${basePath}/settings/`]);
  }
  if (res.locals.newAccessToken) lpsr.newAccessToken = res.locals.newAccessToken;
  return res.status(lpsr.statusCode).json(lpsr);
};

export const getAllSubgroupsHandler = async (req: Request, res: Response) => {
  const subgroups = await purposeService.getAllSubgroups();
  await setCache(req.redis, req.originalUrl, subgroups);
  return res.status(subgroups.statusCode).json(subgroups);
};

export const getPurposeSubgroupsHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await purposeService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupsSR = await purposeService.getSubgroupsByPurpose(purposeId);
  await setCache(req.redis, req.originalUrl, subgroupsSR);
  return res.status(subgroupsSR.statusCode).json(subgroupsSR);
};

export const createSubgroupHandler = async (req: Request, res: Response) => {
  const { purposeId } = req.params;
  const purposeExistsSR = await purposeService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupData = sanitizeData(purposeSubgroupCreateFields, req.body);
  const subgroupExistsSR = await purposeService.getSubgroupByKey(subgroupData.purposeSubgroup);
  if (subgroupExistsSR.success) {
    const sr = new ServiceResponse('Subgroup already exists', subgroupExistsSR.data, false, 400, 'Subgroup already exists', 'LISTING_SERVICE_SUBGROUP_ALREADY_EXISTS', 'Try a different subgroup Key');
    return res.status(sr.statusCode).json(sr);
  }
  subgroupData.descriptionText = stripHTML(subgroupData.descriptionHTML);
  const subgroupSR = await purposeService.createPurposeSubgroup(purposeId, subgroupData);
  if (subgroupSR.success) {
    db.getCollection('subgroups').insert(subgroupSR.data);
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/subgroups`, `${basePath}/settings/purposes`, `${basePath}/settings/purposes/${purposeId}`, `${basePath}/settings`]);
  }
  if (res.locals.newAccessToken) subgroupSR.newAccessToken = res.locals.newAccessToken;
  return res.status(subgroupSR.statusCode).json(subgroupSR);
};

export const updateSubgroupHandler = async (req: Request, res: Response) => {
  const { purposeId, subgroupId } = req.params;
  const { newkey } = req.query;
  if (newkey) {
    const keyAlreadyTaken = await purposeService.getSubgroupByKey(newkey as string);
    if (keyAlreadyTaken.success) {
      const sr = new ServiceResponse('Subgroup key already exists', keyAlreadyTaken.data, false, 400, 'Subgroup already exists', 'LISTING_SERVICE_SUBGROUP_ALREADY_EXISTS', 'Try a different subgroup Key');
      return res.status(sr.statusCode).json(sr);
    }
  }
  const purposeExistsSR = await purposeService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupExistsSR = await purposeService.getSubgroupByKey(subgroupId);
  if (!subgroupExistsSR.success) {
    return res.status(subgroupExistsSR.statusCode).json(subgroupExistsSR);
  }
  if (subgroupExistsSR.data.listingPurpose !== purposeId) {
    const sr = new ServiceResponse('Subgroup does not belong to purpose', subgroupExistsSR.data, false, 400, 'Subgroup does not belong to purpose', 'LISTING_SERVICE_SUBGROUP_PURPOSE_MISMATCH', 'Use matching purpose and subgroup');
    return res.status(sr.statusCode).json(sr);
  }
  const subgroupData = sanitizeData(purposeSubgroupUpdateFields, req.body);
  if (subgroupData.descriptionHTML) {
    subgroupData.descriptionText = stripHTML(subgroupData.descriptionHTML);
  }
  if (newkey) subgroupData.purposeSubgroup = newkey;
  const subgroupSR = await purposeService.updatePurposeSubgroup(subgroupId, subgroupData);
  if (subgroupSR.success) {
    const { _count: count } = subgroupSR.data;
    if (newkey && count.listings) {
      const affectedListings = (await purposeService
        .getListingIdsWhereSubgroup(newkey as string)).data;
      if (affectedListings) {
        await pb.saveAuth(req.user.pbToken, req.user.pbUser);
        const result = await pb.updateRecordsInParallel('listings', affectedListings.map((x: { listingId: any }) => x.listingId), { listingPurposeSubgroup: newkey });
        console.log({ result });
      }
    }
    const subgroups = db.getCollection('subgroups');
    let subgroup = subgroups.findOne({ purposeSubgroup: subgroupId });
    subgroup = { ...subgroup, ...subgroupSR.data };
    subgroups.update(subgroup);
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/subgroups`, `${basePath}/settings/purposes/${purposeId}`, `${basePath}/settings/purposes/${purposeId}/subgroups`, `${basePath}/settings/`]);
  }
  if (res.locals.newAccessToken) subgroupSR.newAccessToken = res.locals.newAccessToken;
  return res.status(subgroupSR.statusCode).json(subgroupSR);
};

export const deleteSubgroupHandler = async (req: Request, res: Response) => {
  const { purposeId, subgroupId } = req.params;
  const purposeExistsSR = await purposeService.getListingPurposeByKey(purposeId);
  if (!purposeExistsSR.success) return res.status(purposeExistsSR.statusCode).json(purposeExistsSR);
  const subgroupExistsSR = await purposeService.getSubgroupByKey(subgroupId);
  if (!subgroupExistsSR.success) {
    return res.status(subgroupExistsSR.statusCode).json(subgroupExistsSR);
  }
  if (subgroupExistsSR.data.listingPurpose !== purposeId) {
    const sr = new ServiceResponse('Subgroup does not belong to purpose', subgroupExistsSR.data, false, 400, 'Subgroup does not belong to purpose', 'LISTING_SERVICE_SUBGROUP_PURPOSE_MISMATCH', 'Use matching purpose and subgroup keys');
    return res.status(sr.statusCode).json(sr);
  }
  const { _count: count } = subgroupExistsSR.data;
  if (count.listings) {
    const sr = new ServiceResponse('Subgroups with listings cannot be deleted', subgroupExistsSR.data, false, 400, 'Subgroup has listings', 'LISTING_SERVICE_SUBGROUP_HAS_LISTINGS', 'Subgroup has listings');
    return res.status(sr.statusCode).json(sr);
  }
  const delSubgroupSR = await purposeService.deletePurposeSubgroup(subgroupId);
  if (delSubgroupSR.success) {
    const subgroups = db.getCollection('subgroups');
    const sgtd = subgroups.findOne({ purposeSubgroup: subgroupId });
    subgroups.remove(sgtd);
    // db.getCollection('subgroups').remove({ purposeSubgroup: subgroupId });
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/subgroups`, `${basePath}/settings/purposes`, `${basePath}/settings/purposes/${purposeId}`, `${basePath}/settings/purposes/${purposeId}/subgroups`, `${basePath}/settings/`]);
  }
  if (res.locals.newAccessToken) delSubgroupSR.newAccessToken = res.locals.newAccessToken;
  return res.status(delSubgroupSR.statusCode).json(delSubgroupSR);
};
