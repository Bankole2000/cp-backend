import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse,
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class ListingTypeDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getListingTypes() {
    try {
      const listingTypes = await this.prisma.listingType.findMany({
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      return new ServiceResponse('Listing Types retrieved successfully', listingTypes, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Types', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingTypeByKey(listingType: string) {
    try {
      const listingTypeData = await this.prisma.listingType.findUnique({
        where: {
          listingType
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (listingTypeData) {
        return new ServiceResponse('Listing Type retrieved successfully', listingTypeData, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing Type not found', listingTypeData, false, 404, 'Listing Type not found', 'LISTING_SERVICE_LISTING_TYPE_NOT_FOUND', 'Confirm that Listing Type exists');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Type', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async createListingType(listingTypeData: any) {
    try {
      const newListingType = await this.prisma.listingType.create({
        data: {
          ...listingTypeData
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (newListingType) {
        return new ServiceResponse('Listing Type created successfully', newListingType, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to create Listing Type', newListingType, false, 400, 'Failed to create Listing Type', 'LISTING_SERVICE_ERROR_CREATING_LISTING_TYPE', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error creating Listing Type', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async updateListingType(listingType: string, listingTypeData: any) {
    try {
      const updatedListingType = await this.prisma.listingType.update({
        where: {
          listingType,
        },
        data: {
          ...listingTypeData
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (updatedListingType) {
        return new ServiceResponse('Listing Type updated successfully', updatedListingType, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to update Listing Type', updatedListingType, false, 400, 'Failed to update Listing Type', 'LISTING_SERVICE_ERROR_UPDATING_LISTING_TYPE', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error updating Listing Type', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async deleteListingType(listingType: string) {
    try {
      const deletedListingType = await this.prisma.listingType.delete({
        where: {
          listingType
        }
      });
      if (deletedListingType) {
        return new ServiceResponse('Listing Type deleted successfully', deletedListingType, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to delete Listing Type', deletedListingType, false, 400, 'Failed to delete Listing Type', 'LISTING_SERVICE_ERROR_DELETING_LISTING_TYPE', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error deleting Listing Type', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }
}
