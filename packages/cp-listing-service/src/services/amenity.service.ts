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

  async getListingAmenities(listingId: string) {
    try {
      const listingAmenities = await this.prisma.listingHasAmenities.findMany({
        where: {
          listingId,
        },
        include: {
          amenityData: {
            include: {
              amenityCategoryData: true,
              _count: {
                select: {
                  listings: true,
                }
              }
            }
          }
        }
      });
      const sr = new ServiceResponse('Listing amenities', listingAmenities, true, 200, null, null, null);
      return sr;
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting listing amenities', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addAmenityToListing(listingId: string, amenityData: any) {
    try {
      const listingAmenity = await this.prisma.listingHasAmenities.create({
        data: {
          listingId,
          ...amenityData
        },
        include: {
          amenityData: true,
        }
      });
      if (listingAmenity) {
        return new ServiceResponse('Listing Amenity Added', listingAmenity, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding listing amenity', listingAmenity, false, 400, 'Error adding listing amenity', 'LISTING_SERVICE_ERROR_ADDING_AMENITY_TO_LISTING', 'Check inputs logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding listing amenity', null, false, 500, error.message, error, 'Check database and logs');
    }
  }

  async listingHasAmenity(listingId: string, amenity: string) {
    try {
      const listingAmenity = await this.prisma.listingHasAmenities.findUnique({
        where: {
          listingId_amenity: {
            listingId,
            amenity,
          }
        },
        include: {
          amenityData: true,
        }
      });
      console.log({ listingAmenity });
      if (listingAmenity) {
        return new ServiceResponse('Listing Amenity Found', listingAmenity, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing Amenity not found', listingAmenity, false, 404, 'Listing doest not have amenity', 'LISTING_SERVICE_LISTING_AMENITY_NOT_FOUND', 'Check listing has amenity');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting listing amenity', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async updateListingAmenity(listingId: string, amenity: string, amenityData: any) {
    try {
      const updatedListingAmenity = await this.prisma.listingHasAmenities.update({
        where: {
          listingId_amenity: {
            listingId,
            amenity,
          },
        },
        data: {
          ...amenityData,
        },
        include: {
          amenityData: true,
        }
      });
      if (updatedListingAmenity) {
        return new ServiceResponse('Listing amenity updated', updatedListingAmenity, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating listing amenity', updatedListingAmenity, false, 400, 'Error updating listing amenity', 'LISTING_SERVICE_ERROR_UPDATING_LISTING_AMENITY', 'Check inputs, database and logs');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating listing amenity', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addMultipleListingAmenities(listingId: string, amenityData: any[]) {
    const listingHasAmenityData = amenityData
      .map((x: { amenity: string, description: string | null }) => ({
        amenity: x.amenity,
        description: x.description,
        listingId,
      }));
    try {
      const listingAmenities = await this.prisma.listingHasAmenities.createMany({
        data: listingHasAmenityData,
        skipDuplicates: true,
      });
      console.log({ listingAmenities });
      const sr = new ServiceResponse('Listing amenities set', listingAmenities, true, 200, null, null, null);
      return sr;
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error saving listing amenities', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async removeListingAmenity(listingId: string, amenity: string) {
    try {
      const removedListingAmenity = await this.prisma.listingHasAmenities.delete({
        where: {
          listingId_amenity: {
            amenity,
            listingId,
          }
        },
        include: {
          amenityData: true,
        }
      });
      if (removedListingAmenity) {
        return new ServiceResponse('Listing Amenity Removed', removedListingAmenity, true, 200, null, null, null);
      }
      return new ServiceResponse('Error removing amenity from listing', removedListingAmenity, false, 400, 'Error removing amenity from listing', 'LISTING_SERVICE_ERROR_REMOVING_LISTING_AMENITY', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error removing amenity from listing', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async removeAllListingAmenities(listingId: string) {
    try {
      const removedAmenities = await this.prisma.listingHasAmenities.deleteMany({
        where: {
          listingId
        }
      });
      if (removedAmenities) {
        return new ServiceResponse('All listing amenities removed', removedAmenities, true, 200, null, null, null);
      }
      return new ServiceResponse('Error removing all listing amenities', removedAmenities, false, 400, 'Error removing all listing amenities', 'LISTING_SERVICE_ERROR_REMOVING_ALL_LISTING_AMENITIES', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error removing all listing amenities', null, false, 500, error.message, error, 'Check logs and database');
    }
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

  async getAmenityByKey(amenityKey: string) {
    try {
      const amenity = await this.prisma.amenity.findUnique({
        where: {
          amenity: amenityKey,
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (amenity) {
        return new ServiceResponse('Amenity found', amenity, true, 200, null, null, null);
      }
      return new ServiceResponse('Amenity not found', null, false, 404, 'Amenity not found', 'LISTING_SERVICE_AMENITY_NOT_FOUND', 'Check amenity and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting amenity', null, false, 500, error.message, error, 'Check database and logs');
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
        },
        include: {
          _count: {
            select: {
              amenities: true
            }
          }
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
        },
        include: {
          _count: {
            select: {
              amenities: true
            }
          }
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
        include: {
          _count: {
            select: {
              amenities: true
            }
          }
        }
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
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
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

  async getAmentiesByCategory(categoryKey: string) {
    try {
      const amenities = await this.prisma.amenity.findMany({
        where: {
          amenityCategory: categoryKey,
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (amenities) {
        const sr = new ServiceResponse('Category Amenities fetched', amenities, true, 200, null, null, null);
        return sr;
      }
      const sr = new ServiceResponse('Error fetching category amenities', null, false, 404, 'Error fetching category amenities', 'LISTING_SERVICE_ERROR_FETCHING_AMENITIES', 'Check all fields and try again');
      return sr;
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error fetching amenities', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async updateAmenity(amenityKey: string, amenityData: any) {
    try {
      const updatedAmenity = await this.prisma.amenity.update({
        where: {
          amenity: amenityKey,
        },
        data: {
          ...amenityData,
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (updatedAmenity) {
        const sr = new ServiceResponse('Amenity updated', updatedAmenity, true, 200, null, null, null);
        return sr;
      }
      const sr = new ServiceResponse('Error updating amenity', updatedAmenity, false, 400, 'Error updating amenity', 'LISTING_SERVICE_ERROR_UPDATING_AMENITY', 'Check all fields and try again');
      return sr;
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error updating amenity', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async deleteAmenity(amenityKey: string) {
    try {
      const deletedAmenity = await this.prisma.amenity.delete({
        where: {
          amenity: amenityKey,
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (deletedAmenity) {
        const sr = new ServiceResponse('Amenity deleted', deletedAmenity, true, 200, null, null, null);
        return sr;
      }
      const sr = new ServiceResponse('Error deleting amenity', null, false, 500, 'Error deleting amenity', 'LISTING_SERVICE_ERROR_DELETING_AMENITY', 'Check all fields and try again');
      return sr;
    } catch (error: any) {
      const sr = new ServiceResponse('Error deleting amenity', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }
}
