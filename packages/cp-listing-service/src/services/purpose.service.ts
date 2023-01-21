import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse,
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class ListingPurposeDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getListingPurposes() {
    try {
      const listingPurposes = await this.prisma.listingPurpose.findMany({
        include: {
          _count: {
            select: {
              purposeSubgroups: true,
              listings: true,
            }
          }
        }
      });
      return new ServiceResponse('Listing Purposes retrieved successfully', listingPurposes, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Purposes', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingPurposeByKey(listingPurpose: string) {
    try {
      const listingPurposeData = await this.prisma.listingPurpose.findUnique({
        where: {
          listingPurpose
        },
        include: {
          _count: {
            select: {
              purposeSubgroups: true,
              listings: true,
            }
          }
        }
      });
      if (listingPurposeData) {
        return new ServiceResponse('Listing Purpose retrieved successfully', listingPurposeData, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing Purpose not found', listingPurposeData, false, 404, 'Listing Purpose not found', 'LISTING_SERVICE_LISTING_PURPOSE_NOT_FOUND', 'Confirm that Listing Purpose exists');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Purpose', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getListingPurposeDetails(listingPurpose: string) {
    try {
      const listingPurposeData = await this.prisma.listingPurpose.findUnique({
        where: {
          listingPurpose
        },
        include: {
          _count: {
            select: {
              purposeSubgroups: true,
              listings: true,
            }
          },
          purposeSubgroups: true,
        }
      });
      if (listingPurposeData) {
        return new ServiceResponse('Listing Purpose retrieved successfully', listingPurposeData, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing Purpose not found', listingPurposeData, false, 404, 'Listing Purpose not found', 'LISTING_SERVICE_PURPOSE_NOT_FOUND', 'Confirm that Listing Purpose exists');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Purpose', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getSubgroupsByPurpose(listingPurpose: string) {
    try {
      const subgroupsByPurpose = await this.prisma.purposeSubgroup.findMany({
        where: {
          listingPurpose
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (subgroupsByPurpose) {
        return new ServiceResponse(`${listingPurpose} Purpose Subgroups retrieved successfully`, subgroupsByPurpose, true, 200, null, null, null);
      }
      return new ServiceResponse(`${listingPurpose} Purpose Subgroups not found`, subgroupsByPurpose, false, 404, `${listingPurpose} Purpose Subgroups not found`, 'LISTING_SERVICE_PURPOSE_SUBGROUPS_NOT_FOUND', 'Confirm that Listing Purpose has subgroups');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Purpose Subgroups', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getSubgroupByKey(subgroupKey: string) {
    try {
      const subgroup = await this.prisma.purposeSubgroup.findUnique({
        where: {
          purposeSubgroup: subgroupKey
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          },
          listingPurposeData: true,
        }
      });
      if (subgroup) {
        return new ServiceResponse(`${subgroupKey} Subgroup retrieved successfully`, subgroup, true, 200, null, null, null);
      }
      return new ServiceResponse(`${subgroupKey} Subgroup not found`, subgroup, false, 404, `${subgroupKey} Subgroup not found`, 'LISTING_SERVICE_PURPOSE_SUBGROUP_NOT_FOUND', 'Confirm that Purpose Subgroup exists');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Purpose Subgroups', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async getAllSubgroups() {
    try {
      const allSubgroups = await this.prisma.purposeSubgroup.findMany({
        include: {
          _count: {
            select: {
              listings: true,
            }
          }
        }
      });
      if (allSubgroups) {
        return new ServiceResponse('All Purpose Subgroups retrieved successfully', allSubgroups, true, 200, null, null, null);
      }
      return new ServiceResponse('No Subgroups found', allSubgroups, false, 404, 'Error retrieving Subgroups', 'LISTING_SERVICE_PURPOSE_SUBGROUPS_NOT_FOUND', 'Confirm that purpose subgroups exist');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error getting Listing Purpose Subgroups', null, false, 500, error.message, error, 'Check logs and database');
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
      console.log({ error });
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
      console.log({ error });
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
      console.log({ error });
      const sr = new ServiceResponse('Error deleting Listing Purpose', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async createPurposeSubgroup(listingPurpose: string, purposeSubgroupData: any) {
    try {
      const newPurposeSubgroup = await this.prisma.purposeSubgroup.create({
        data: {
          listingPurpose,
          ...purposeSubgroupData
        }
      });
      if (newPurposeSubgroup) {
        return new ServiceResponse('Purpose Subgroup created successfully', newPurposeSubgroup, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to create Purpose Subgroup', newPurposeSubgroup, false, 400, 'Failed to create Purpose Subgroup', 'LISTING_SERVICE_ERROR_CREATING_PURPOSE_SUBGROUP', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error creating Purpose Subgroup', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async updatePurposeSubgroup(purposeSubgroup: string, purposeSubgroupData: any) {
    try {
      const updatedPurposeSubgroup = await this.prisma.purposeSubgroup.update({
        where: {
          purposeSubgroup
        },
        data: {
          ...purposeSubgroupData
        }
      });
      if (updatedPurposeSubgroup) {
        return new ServiceResponse('Purpose Subgroup updated successfully', updatedPurposeSubgroup, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to update Purpose Subgroup', updatedPurposeSubgroup, false, 400, 'Failed to update Purpose Subgroup', 'LISTING_SERVICE_ERROR_UPDATING_PURPOSE_SUBGROUP', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error updating Purpose Subgroup', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }

  async deletePurposeSubgroup(purposeSubgroup: string) {
    try {
      const deletedPurposeSubgroup = await this.prisma.purposeSubgroup.delete({
        where: {
          purposeSubgroup
        }
      });
      if (deletedPurposeSubgroup) {
        return new ServiceResponse('Purpose Subgroup deleted successfully', deletedPurposeSubgroup, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to delete Purpose Subgroup', deletedPurposeSubgroup, false, 400, 'Failed to delete Purpose Subgroup', 'LISTING_SERVICE_ERROR_DELETING_PURPOSE_SUBGROUP', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      const sr = new ServiceResponse('Error deleting Purpose Subgroup', null, false, 500, error.message, error, 'Check logs and database');
      return sr;
    }
  }
}
