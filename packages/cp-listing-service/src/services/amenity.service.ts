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
}
