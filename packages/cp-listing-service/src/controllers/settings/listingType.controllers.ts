import { Request, Response } from 'express';
import { ServiceResponse } from '@cribplug/common';
import { sanitizeData, stripHTML } from '../../schema/listing.schema';
import { listingTypeCreateFields, listingTypeUpdateFields } from '../../schema/listingType.schema';
import ListingTypeDBService from '../../services/listingType.service';
import { db } from '../../lib/lokijs';
import { config } from '../../utils/config';
import { deleteCache, setCache } from '../../services/cache.service';
import PBService from '../../services/pb.service';

const { self: { basePath }, pocketbase } = config;
const pb = new PBService(pocketbase.url as string);
const listingTypeService = new ListingTypeDBService();

export const getListingTypesHandler = async (req: Request, res: Response) => {
  const listingTypes = await listingTypeService.getListingTypes();
  await setCache(req.redis, req.originalUrl, listingTypes);
  return res.status(listingTypes.statusCode).json(listingTypes);
};

export const createListingTypeHandler = async (req: Request, res: Response) => {
  const listingTypeData = sanitizeData(listingTypeCreateFields, req.body);
  if (listingTypeData.descriptionHTML) {
    listingTypeData.descriptionText = stripHTML(listingTypeData.descriptionHTML);
  }
  const ltsr = await listingTypeService.createListingType(listingTypeData);
  if (ltsr.success) {
    db.getCollection('listingTypes').insert(ltsr.data);
    db.save();
  }
  return res.status(ltsr.statusCode).json(ltsr);
};

export const updateListingTypeHandler = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  const { newkey } = req.query;
  const typeExistsSR = await listingTypeService.getListingTypeByKey(typeId);
  if (!typeExistsSR.success) return res.status(typeExistsSR.statusCode).json(typeExistsSR);
  const listingTypeData = sanitizeData(listingTypeUpdateFields, req.body);
  if (listingTypeData.descriptionHTML) {
    listingTypeData.descriptionText = stripHTML(listingTypeData.descriptionHTML);
  }
  if (newkey) {
    listingTypeData.listingType = newkey;
  }
  const ltsr = await listingTypeService.updateListingType(typeId, listingTypeData);
  if (ltsr.success) {
    const { _count: count } = ltsr.data;
    if (newkey && count.listings) {
      const affectedListings = (await listingTypeService
        .getListingIdsWhereType(newkey as string)).data;
      if (affectedListings) {
        await pb.saveAuth(req.user.pbToken, req.user.pbUser);
        const result = await pb.updateRecordsInParallel('listings', affectedListings.map((x: { listingId: any; }) => x.listingId), { listingType: newkey });
        console.log({ result });
      }
    }
    const lts = db.getCollection('listingTypes');
    let oldlt = lts.findOne({ listingType: typeId });
    oldlt = { ...oldlt, ...ltsr.data };
    lts.update(oldlt);
    db.save();
    await deleteCache(req.redis, [`${basePath}/settings/listing-types`, `${basePath}/settings/`]);
  }
  return res.status(ltsr.statusCode).json(ltsr);
};

export const deleteListingTypeHandler = async (req: Request, res: Response) => {
  const { typeId } = req.params;
  const typeExistsSR = await listingTypeService.getListingTypeByKey(typeId);
  if (!typeExistsSR.success) return res.status(typeExistsSR.statusCode).json(typeExistsSR);
  const { _count: count } = typeExistsSR.data;
  if (count.listings) {
    const sr = new ServiceResponse(
      'Listing Type is in use and cannot be deleted',
      typeExistsSR.data,
      false,
      400,
      'Listing Type is in use and cannot be deleted',
      'LISTING_SERVICE_ERROR_TYPE_HAS_LISTINGS',
      'Remove the listing type from all listings before deleting it'
    );
    return res.status(sr.statusCode).json(sr);
  }
  const ltsr = await listingTypeService.deleteListingType(typeId);
  if (ltsr.success) {
    const deletedlt = db.getCollection('listingTypes').findOne({ listingType: typeId });
    db.getCollection('listingTypes').remove(deletedlt);
    db.save();
    await deleteCache(req.redis, [`${basePath}/settings/listing-types`, `${basePath}/settings/`]);
  }
  return res.status(ltsr.statusCode).json(ltsr);
};
