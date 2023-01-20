import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse,
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class AmenityDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getAmenityCategories() {
    try {
      const amenityCategories = await this.prisma.amenityCategory.findMany({
        include: {
          _count: {
            select: {
              amenities: true,
            }
          }
        }
      });
      const sr = new ServiceResponse('Amenity categories', amenityCategories, true, 200, null, null, null);
      return sr;
    } catch (error: any) {
      const sr = new ServiceResponse('Error getting amenity categories', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async getCategoryByKey(amenityCategory: string) {
    try {
      const category = await this.prisma.amenityCategory.findUnique({
        where: {
          amenityCategory,
        },
        include: {
          _count: {
            select: {
              amenities: true,
            }
          },
          amenities: true,
        }
      });
      if (category) {
        return new ServiceResponse('Amenity category found', category, true, 200, null, null, null);
      }
      return new ServiceResponse('Amenity category not found', null, false, 404, 'Amenity category not found', 'LISTING_SERVICE_AMENITY_CATEGORY_NOT_FOUND', 'Check amenity category and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting amenity category', null, false, 500, error.message, error, 'Check database and logs');
    }
  }

  async updateAmenityCategory(categoryKey: string, categoryData: any) {
    try {
      const updatedCategory = await this.prisma.amenityCategory.update({
        where: {
          amenityCategory: categoryKey,
        },
        data: {
          ...categoryData,
        }
      });
      if (updatedCategory) {
        return new ServiceResponse('Amenity category updated', updatedCategory, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating amenity category', null, false, 500, 'Error updating amenity category', 'LISTING_SERVICE_ERROR_UPDATING_AMENITY_CATEGORY', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error updating amenity category', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async deleteAmenityCategory(categoryKey: string) {
    try {
      const deletedCategory = await this.prisma.amenityCategory.delete({
        where: {
          amenityCategory: categoryKey,
        }
      });
      if (deletedCategory) {
        return new ServiceResponse('Amenity category deleted', deletedCategory, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting amenity category', null, false, 500, 'Error deleting amenity category', 'LISTING_SERVICE_ERROR_DELETING_AMENITY_CATEGORY', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error deleting amenity category', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async createAmenityCategory(categoryData: any) {
    try {
      const amenityCategory = await this.prisma.amenityCategory.create({
        data: {
          ...categoryData,
        },
      });
      if (amenityCategory) {
        return new ServiceResponse('Amenity category created', amenityCategory, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating amenity category', null, false, 500, 'Error creating amenity category', 'LISTING_SERVICE_ERROR_CREATING_AMENITY_CATEGORY', 'Check all fields and try again');
    } catch (error: any) {
      const sr = new ServiceResponse('Error creating amenity category', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async getAllAmenities() {
    try {
      const allAmenities = await this.prisma.amenity.findMany({
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      const sr = new ServiceResponse('Fetched All amenities', allAmenities, true, 200, null, null, null);
      return sr;
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting amenities', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async createAmenity(amenityData: any) {
    try {
      const newAmenity = await this.prisma.amenity.create({
        data: {
          ...amenityData,
        }
      });
      if (newAmenity) {
        const sr = new ServiceResponse('Amenity created', newAmenity, true, 200, null, null, null);
        return sr;
      }
      const sr = new ServiceResponse('Error creating amenity', null, false, 500, 'Error creating amenity', 'LISTING_SERVICE_ERROR_CREATING_AMENITY', 'Check all fields and try again');
      return sr;
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error creating amenity', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }
}
