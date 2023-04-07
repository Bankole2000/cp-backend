import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import {
  createAmenityFields,
  createCategoryFields,
  updateAmenityFields,
  updateCategoryFields
} from '../../schema/amenity.schema';
import { sanitizeData, stripHTML } from '../../schema/listing.schema';
import { db } from '../../lib/lokijs';
import AmenityDBService from '../../services/amenity.service';
import {
  deleteCache,
  setCache
} from '../../services/cache.service';
import { config } from '../../utils/config';

const { basePath } = config.self;

const amenityService = new AmenityDBService();

export const getAllAmenitiesHandler = async (req: Request, res: Response) => {
  console.log({ req });
  const amenities = await amenityService.getAllAmenities();
  await setCache(req.redis, req.originalUrl, amenities);
  return res.status(amenities.statusCode).json(amenities);
};

export const createAmenityHandler = async (req: Request, res: Response) => {
  const { categorykey } = req.params;
  const amenityData = sanitizeData(createAmenityFields, req.body);
  amenityData.amenityCategory = categorykey;
  if (amenityData.descriptionHTML) {
    amenityData.descriptionText = stripHTML(amenityData.descriptionHTML);
  }
  const amenity = await amenityService.createAmenity(amenityData);
  if (amenity.success) {
    db.getCollection('amenities').insert(amenity.data);
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/amenities`, `${basePath}/settings/`]);
  }
  return res.status(amenity.statusCode).json(amenity);
};

export const updateAmenityHandler = async (req: Request, res: Response) => {
  const { amenitykey } = req.params;
  const { newkey } = req.query;
  const amenityData = sanitizeData(updateAmenityFields, req.body);
  const amenityExists = await amenityService.getAmenityByKey(amenitykey);
  if (!amenityExists.success) {
    return res.status(amenityExists.statusCode).json(amenityExists);
  }
  if (amenityData.descriptionHTML) {
    amenityData.descriptionText = stripHTML(amenityData.descriptionHTML);
  }
  if (newkey) {
    amenityData.amenity = newkey;
  }
  const amenity = await amenityService.updateAmenity(amenitykey, amenityData);
  if (amenity.success) {
    const amenities = db.getCollection('amenities');
    const oldamenity = amenities.findOne({ amenity: amenitykey });
    amenities.remove(oldamenity);
    amenities.insert(amenity.data);
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/amenities`, `${basePath}/settings/amenity-categories`, `${basePath}/settings/`]);
  }
  return res.status(amenity.statusCode).json(amenity);
};

export const createAmenityCategoryHandler = async (req: Request, res: Response) => {
  const categoryData = sanitizeData(createCategoryFields, req.body);
  if (categoryData.descriptionHTML) {
    categoryData.descriptionText = stripHTML(categoryData.descriptionHTML);
  }
  const amenityCategory = await amenityService.createAmenityCategory(categoryData);
  if (amenityCategory.success) {
    db.getCollection('amenityCategories').insert(amenityCategory.data);
    db.saveDatabase();
    await deleteCache(req.redis, [req.originalUrl, `${basePath}/settings/amenities`, `${basePath}/settings/`]);
  }
  return res.status(amenityCategory.statusCode).json(amenityCategory);
};

export const updateAmenityCategoryHandler = async (req: Request, res: Response) => {
  const { categorykey } = req.params;
  const { newkey } = req.query;
  const categoryData = sanitizeData(updateCategoryFields, req.body);
  if (categoryData.descriptionHTML) {
    categoryData.descriptionText = stripHTML(categoryData.descriptionHTML);
  }
  if (newkey) categoryData.amenityCategory = newkey as string;
  const amenityCategory = await amenityService.updateAmenityCategory(categorykey, categoryData);
  if (amenityCategory.success) {
    const categories = db.getCollection('amenityCategories');
    let category = categories.findOne({ amenityCategory: categorykey });
    category = { ...category, ...amenityCategory.data };
    categories.update(category);
    if (newkey) {
      const relatedAmenities = db.getCollection('amenities').find({ amenityCategory: categorykey });
      relatedAmenities.forEach((amenity) => {
        // eslint-disable-next-line no-param-reassign
        amenity.amenityCategory = newkey as string;
        db.getCollection('amenities').update(amenity);
      });
    }
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/amenities`, `${basePath}/settings/amenity-categories`, `${basePath}/settings/`]);
  }
  return res.status(amenityCategory.statusCode).json(amenityCategory);
};

export const deleteAmenityHandler = async (req: Request, res: Response) => {
  console.log({ req });
  const { amenitykey } = req.params;
  const amenityExists = await amenityService.getAmenityByKey(amenitykey);
  const { _count: count } = amenityExists.data;
  if (count.listings) {
    const sr = new ServiceResponse(
      'Amenity is in use and cannot be deleted',
      amenityExists.data,
      false,
      400,
      'Amenity is in use and cannot be deleted',
      'LISTING_SERVICE_ERROR_AMENITY_HAS_LISTINGS',
      'Remove the amenity from all listings before deleting it'
    );
    return res.status(sr.statusCode).json(sr);
  }
  const amenity = await amenityService.deleteAmenity(amenitykey);
  if (amenity.success) {
    const amenities = db.getCollection('amenities');
    const oldamenity = amenities.findOne({ amenity: amenitykey });
    amenities.remove(oldamenity);
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/amenities`, `${basePath}/settings/amenity-categories`, `${basePath}/settings/`]);
  }
  return res.status(amenity.statusCode).json(amenity);
};

export const deleteAmenityCategoryHandler = async (req: Request, res: Response) => {
  console.log({ req });
  const { categorykey } = req.params;
  const categoryExists = await amenityService.getCategoryByKey(categorykey);
  if (!categoryExists.success) {
    return res.status(categoryExists.statusCode).json(categoryExists);
  }
  const { _count: count } = categoryExists.data;
  if (count.amenities > 0) {
    const sr = new ServiceResponse('Cannot delete category with amenities', categoryExists.data, false, 400, 'Cannot delete category with amenities', 'LISTING_SERVICE_CATEGORY_HAS_AMENITIES', 'Delete category amenities and try again');
    return res.status(sr.statusCode).json(sr);
  }
  const amenityCategory = await amenityService.deleteAmenityCategory(categorykey);
  if (amenityCategory.success) {
    const categories = db.getCollection('amenityCategories');
    const category = categories.findOne({ amenityCategory: categorykey });
    categories.remove(category);
    db.saveDatabase();
    await deleteCache(req.redis, [`${basePath}/settings/amenity-categories`, `${basePath}/settings/`]);
  }
  return res.status(amenityCategory.statusCode).json(amenityCategory);
};

export const getAllAmenityCategoriesHandler = async (req: Request, res: Response) => {
  console.log({ req });
  const amenityCategories = await amenityService.getAmenityCategories();
  await setCache(req.redis, req.originalUrl, amenityCategories);
  return res.status(amenityCategories.statusCode).json(amenityCategories);
};

export const getCategoryAmenitiesHandler = async (req: Request, res: Response) => {
  const { categorykey } = req.params;
  const categoryExists = await amenityService.getCategoryByKey(categorykey);
  if (!categoryExists.success) {
    return res.status(categoryExists.statusCode).json(categoryExists);
  }
  const amenities = await amenityService.getAmentiesByCategory(categorykey);
  await setCache(req.redis, req.originalUrl, amenities);
  return res.status(amenities.statusCode).json(amenities);
};
