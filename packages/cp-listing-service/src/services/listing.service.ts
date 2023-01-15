import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse,
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class ListingDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getListingPurposes() {
    try {
      const listingPurposes = await this.prisma.listingPurpose.findMany();
      return new ServiceResponse('Listing Purposes retrieved successfully', listingPurposes, true, 200, null, null, null);
    } catch (error: any) {
      const sr = new ServiceResponse('Error getting Listing Purposes', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingPurposeByKey(listingPurpose: string) {
    try {
      const listingPurposeData = await this.prisma.listingPurpose.findUnique({
        where: {
          listingPurpose
        }
      });
      if (listingPurposeData) {
        return new ServiceResponse('Listing Purpose retrieved successfully', listingPurposeData, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing Purpose not found', listingPurposeData, false, 404, 'Listing Purpose not found', 'LISTING_SERVICE_LISTING_PURPOSE_NOT_FOUND', 'Confirm that Listing Purpose exists');
    } catch (error: any) {
      const sr = new ServiceResponse('Error getting Listing Purpose', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async createListingPurpose(listingPurposeData: any) {
    try {
      const newListingPurpose = await this.prisma.listingPurpose.create({
        data: {
          ...listingPurposeData
        }
      });
      if (newListingPurpose) {
        return new ServiceResponse('Listing Purpose created successfully', newListingPurpose, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to create Listing Purpose', newListingPurpose, false, 400, 'Failed to create Listing Purpose', 'LISTING_SERVICE_ERROR_CREATING_LISTING_PURPOSE', 'Check all fields and try again');
    } catch (error: any) {
      const sr = new ServiceResponse('Error creating Listing Purpose', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async updateListingPurpose(listingPurpose: string, listingPurposeData: any) {
    try {
      const updatedListingPurpose = await this.prisma.listingPurpose.update({
        where: {
          listingPurpose
        },
        data: {
          ...listingPurposeData
        }
      });
      if (updatedListingPurpose) {
        return new ServiceResponse('Listing Purpose updated successfully', updatedListingPurpose, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to update Listing Purpose', updatedListingPurpose, false, 400, 'Failed to update Listing Purpose', 'LISTING_SERVICE_ERROR_UPDATING_LISTING_PURPOSE', 'Check all fields and try again');
    } catch (error: any) {
      const sr = new ServiceResponse('Error updating Listing Purpose', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async deleteListingPurpose(listingPurpose: string) {
    try {
      const deletedListingPurpose = await this.prisma.listingPurpose.delete({
        where: {
          listingPurpose
        }
      });
      if (deletedListingPurpose) {
        return new ServiceResponse('Listing Purpose deleted successfully', deletedListingPurpose, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to delete Listing Purpose', deletedListingPurpose, false, 400, 'Failed to delete Listing Purpose', 'LISTING_SERVICE_ERROR_DELETING_LISTING_PURPOSE', 'Check all fields and try again');
    } catch (error: any) {
      const sr = new ServiceResponse('Error deleting Listing Purpose', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingTypes() {
    try {
      const listingTypes = await this.prisma.listingType.findMany();
      return new ServiceResponse('Listing Types retrieved successfully', listingTypes, true, 200, null, null, null);
    } catch (error: any) {
      const sr = new ServiceResponse('Error getting Listing Types', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingTypeByKey(listingType: string) {
    try {
      const listingTypeData = await this.prisma.listingType.findUnique({
        where: {
          listingType
        }
      });
      if (listingTypeData) {
        return new ServiceResponse('Listing Type retrieved successfully', listingTypeData, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing Type not found', listingTypeData, false, 404, 'Listing Type not found', 'LISTING_SERVICE_LISTING_TYPE_NOT_FOUND', 'Confirm that Listing Type exists');
    } catch (error: any) {
      const sr = new ServiceResponse('Error getting Listing Type', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async createListingType(listingTypeData: any) {
    try {
      const newListingType = await this.prisma.listingType.create({
        data: {
          ...listingTypeData
        }
      });
      if (newListingType) {
        return new ServiceResponse('Listing Type created successfully', newListingType, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to create Listing Type', newListingType, false, 400, 'Failed to create Listing Type', 'LISTING_SERVICE_ERROR_CREATING_LISTING_TYPE', 'Check all fields and try again');
    } catch (error: any) {
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
        }
      });
      if (updatedListingType) {
        return new ServiceResponse('Listing Type updated successfully', updatedListingType, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to update Listing Type', updatedListingType, false, 400, 'Failed to update Listing Type', 'LISTING_SERVICE_ERROR_UPDATING_LISTING_TYPE', 'Check all fields and try again');
    } catch (error: any) {
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
      const sr = new ServiceResponse('Error deleting Listing Type', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }
}
