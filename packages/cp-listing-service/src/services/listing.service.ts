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

  async getAllListings(
    page = 1,
    limit = 12,
    // filter = {
    //   isPublished: true,
    // },
    // orderBy = {
    //   updatedAt: 'desc',
    // },
  ) {
    try {
      const listings = await this.prisma.listing.findMany({
        // where: filter,
        // include: {
        //   listingType: true,
        //   listingImages: true,
        //   listingFeatures: true,
        //   listingAmenities: true,
        //   listingPolicies: true,
        //   listingReviews: true,
        //   listingLocation: true,
        //   listingHost: true,
        //   listingBookings: true,
        // }
        orderBy: {
          updatedAt: 'desc',
        },
        skip: (page - 1) * limit,
        take: limit,
      });
      return new ServiceResponse('Listings retrieved successfully', listings, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listings', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async createListing(userId: string, listingData: any) {
    try {
      const listing = await this.prisma.listing.create({
        data: {
          ...listingData,
          createdBy: userId,
        },
      });
      if (listing) {
        return new ServiceResponse('Listing created successfully', listing, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing not created', listing, false, 404, 'Listing not created', 'LISTING_SERVICE_ERROR_CREATING_LISTING', 'Confirm that Listing was created');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error creating Listing', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async updateListing(listingId: string, listingData: any) {
    try {
      const listing = await this.prisma.listing.update({
        where: {
          listingId
        },
        data: {
          ...listingData
        },
      });
      if (listing) {
        return new ServiceResponse('Listing updated successfully', listing, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing not updated', listing, false, 404, 'Listing not updated', 'LISTING_SERVICE_ERROR_UPDATING_LISTING', 'Confirm that Listing was updated');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error updating Listing', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async deleteListing(listingId: string) {
    try {
      const listing = await this.prisma.listing.delete({
        where: {
          listingId
        },
      });
      if (listing) {
        return new ServiceResponse('Listing deleted successfully', listing, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing not deleted', listing, false, 404, 'Listing not deleted', 'LISTING_SERVICE_ERROR_DELETING_LISTING', 'Confirm that Listing was deleted');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error deleting Listing', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingById(listingId: string) {
    try {
      const listing = await this.prisma.listing.findUnique({
        where: {
          listingId
        }
      });
      if (listing) {
        return new ServiceResponse('Listing retrieved successfully', listing, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing not found', listing, false, 404, 'Listing not found', 'LISTING_SERVICE_LISTING_NOT_FOUND', 'Confirm that Listing exists');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingDetailsById(listingId: string) {
    try {
      const listing = await this.prisma.listing.findUnique({
        where: {
          listingId
        },
        // include: {
        //   listingType: true,
        //   listingImages: true,
        //   listingFeatures: true,
        //   listingAmenities: true,
        //   listingPolicies: true,
        //   listingReviews: true,
        //   listingLocation: true,
        //   listingHost: true,
        //   listingBookings: true,
        // }
      });
      if (listing) {
        return new ServiceResponse('Listing retrieved successfully', listing, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing not found', listing, false, 404, 'Listing not found', 'LISTING_SERVICE_LISTING_NOT_FOUND', 'Confirm that Listing exists');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async addListingImage(listingId: string, imageId: string) {
    console.log({ prisma: this.prisma });
    return new ServiceResponse('Listing image added successfully', null, true, 200, null, null, null);
    // try {
    //   const listing = await this.prisma.listing.update({
    //     where: {
    //       listingId
    //     },
    //     data: {
    //       listingImages: {
    //         connect: {
    //           imageId
    //         }
    //       }
    //     }
    //   });
    //   if (listing) {
    //     return new ServiceResponse('Listing image added successfully', listing, true, 200, null, null, null);
    //   }
    //   return new ServiceResponse('Listing image not added', listing, false, 404, 'Listing image not added', 'LISTING_SERVICE_ERROR_ADDING_LISTING_IMAGE', 'Confirm that Listing image was added');
    // } catch (error: any) {
    //   console.log({ error });
    //   const sr = new ServiceResponse('Error adding Listing image', null, false, 500, error.message, error, 'Check logs and database');
    //   return sr;
    // }
  }
}
