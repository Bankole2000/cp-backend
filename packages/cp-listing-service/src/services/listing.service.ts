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
        include: {
          images: {
            orderBy: {
              order: 'asc'
            }
          },
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

  async addListingImage(imageData: any) {
    try {
      const image = await this.prisma.listingImage.create({
        data: {
          ...imageData
        }
      });
      if (image) {
        return new ServiceResponse('Listing Image added successfully', image, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing Image not added', image, false, 404, 'Listing Image not added', 'LISTING_SERVICE_ERROR_ADDING_LISTING_IMAGE', 'Confirm that Listing Image was added');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error adding Listing Image', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async deleteListingImage(imageId: string) {
    try {
      const deletedListingImage = await this.prisma.listingImage.delete({
        where: {
          id: imageId
        }
      });
      if (deletedListingImage) {
        return new ServiceResponse('listing Image deleted successfully', deletedListingImage, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting listing image', deletedListingImage, false, 400, 'Error deleting image', 'LISTING_SERVICE_ERROR_DELETING_LISTING_IMAGE', 'Check database and logs');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting listing Image', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async setImageOrder(order: number, imageId: string) {
    try {
      const reorderedImage = await this.prisma.listingImage.update({
        where: {
          id: imageId
        },
        data: {
          order
        }
      });
      if (reorderedImage) {
        return new ServiceResponse('Listing image reordered', reorderedImage, true, 200, null, null, null);
      }
      return new ServiceResponse('Error reordering listing image', reorderedImage, false, 401, 'Error updating listing image order', 'LISTING_SERVICE_ERROR_CHANGING_LISTING_IMAGE_ORDER', 'Check database and logs');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting image order', null, false, 500, error.message, error, 'Check database and logs');
    }
  }

  async reorderImagesForward(order: number, listingId: string, imageId: string, stop = 0) {
    try {
      const reorderedImages = await this.prisma.listingImage.updateMany({
        where: {
          AND: [
            {
              listing: listingId
            },
            {
              order: {
                gte: order,
                lt: stop
              }
            },
            {
              id: {
                not: imageId
              }
            }
          ]
        },
        data: {
          order: {
            increment: 1,
          }
        }
      });
      if (reorderedImages) {
        return new ServiceResponse('Images reordered', reorderedImages, true, 200, null, null, null);
      }
      return new ServiceResponse('Error reordering images', reorderedImages, false, 400, 'Error reordering images', 'LISTING_SERVICE_ERROR_REORDERING_IMAGES_FORWARD', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error reordering Images', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async reorderImagesBackward(order: number, listingId: string, imageId: string, stop = 0) {
    try {
      const reorderedImages = await this.prisma.listingImage.updateMany({
        where: {
          AND: [
            {
              listing: listingId
            },
            {
              order: {
                lte: order,
                gt: stop,
              }
            },
            {
              id: {
                not: imageId
              }
            }
          ]
        },
        data: {
          order: {
            increment: -1,
          }
        }
      });
      if (reorderedImages) {
        return new ServiceResponse('Images reordered', reorderedImages, true, 200, null, null, null);
      }
      return new ServiceResponse('Error reordering images', reorderedImages, false, 400, 'Error reordering images', 'LISTING_SERVICE_ERROR_REORDERING_IMAGES_FORWARD', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error reordering Images', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getListingImage(imageId: string) {
    try {
      const listingImage = await this.prisma.listingImage.findUnique({
        where: {
          id: imageId
        }
      });
      if (listingImage) {
        return new ServiceResponse('Found listing image', listingImage, true, 200, null, null, null);
      }
      return new ServiceResponse('Image not found', listingImage, false, 404, 'Image not found', 'LISTING_SERVICE_LISTING_IMAGE_NOT_FOUND', 'Check image id');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting listing Image', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
