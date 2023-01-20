import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import { createCategoryFields, updateCategoryFields } from '../../schema/amenity.schema';
import { sanitizeData, stripHTML } from '../../schema/listing.schema';

import AmenityDBService from '../../services/amenity.service';

const amenityService = new AmenityDBService();

export const getAllAmenitiesHandler = async (req: Request, res: Response) => {
  const amenities = await amenityService.getAllAmenities();
  return res.status(amenities.statusCode).json(amenities);
};

export const createAmenityHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not Implemented', null, false, 200, 'Not Implemented', 'LISTING_SERVICE_NOT_IMPLEMENTED', 'This feature is not yet implemented');
  return res.status(sr.statusCode).json(sr);
};

export const createAmenityCategoryHandler = async (req: Request, res: Response) => {
  const categoryData = sanitizeData(createCategoryFields, req.body);
  const categoryExists = await amenityService.getCategoryByKey(categoryData.amenityCategory);
  if (categoryExists.success) {
    const sr = new ServiceResponse('Amenity category already exists', null, false, 400, 'Amenity category already exists', 'LISTING_SERVICE_AMENITY_CATEGORY_ALREADY_EXISTS', 'Check amenity category and try again');
    return res.status(sr.statusCode).json(sr);
  }
  if (categoryData.descriptionHTML) {
    categoryData.descriptionText = stripHTML(categoryData.descriptionHTML);
  }
  const amenityCategory = await amenityService.createAmenityCategory(categoryData);
  return res.status(amenityCategory.statusCode).json(amenityCategory);
};

export const updateAmenityCategoryHandler = async (req: Request, res: Response) => {
  const { categorykey } = req.params;
  const { newkey } = req.query;
  if (newkey) {
    const categoryExists = await amenityService.getCategoryByKey(newkey as string);
    if (categoryExists.success) {
      const sr = new ServiceResponse('Amenity category already exists', null, false, 400, 'Amenity category already exists', 'LISTING_SERVICE_AMENITY_CATEGORY_ALREADY_EXISTS', 'Check amenity category and try again');
      return res.status(sr.statusCode).json(sr);
    }
  }
  const categoryExists = await amenityService.getCategoryByKey(categorykey);
  if (!categoryExists.success) {
    return res.status(categoryExists.statusCode).json(categoryExists);
  }
  const categoryData = sanitizeData(updateCategoryFields, req.body);
  if (categoryData.descriptionHTML) {
    categoryData.descriptionText = stripHTML(categoryData.descriptionHTML);
  }
  if (newkey) categoryData.amenityCategory = newkey as string;
  const amenityCategory = await amenityService.updateAmenityCategory(categorykey, categoryData);
  return res.status(amenityCategory.statusCode).json(amenityCategory);
};

export const deleteAmenityCategoryHandler = async (req: Request, res: Response) => {
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
  return res.status(amenityCategory.statusCode).json(amenityCategory);
};

export const getAllAmenityCategories = async (req: Request, res: Response) => {
  const amenityCategories = await amenityService.getAmenityCategories();
  return res.status(amenityCategories.statusCode).json(amenityCategories);
};
