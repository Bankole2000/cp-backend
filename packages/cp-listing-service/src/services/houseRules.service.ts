import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse,
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class HouseRulesDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getHouseRules() {
    try {
      const houseRules = await this.prisma.houseRule.findMany({
        include: {
          _count: {
            select: {
              listings: true
            }
          }
        }
      });
      const sr = new ServiceResponse('House rules', houseRules, true, 200, null, null, null);
      return sr;
    } catch (error: any) {
      const sr = new ServiceResponse('Error getting house rules', null, false, 500, error.message, error, 'Check database and logs');
      return sr;
    }
  }

  async getListingHouseRules(listingId: string) {
    try {
      const houseRules = await this.prisma.listingHasHouseRule.findMany({
        where: {
          listingId
        },
        include: {
          houseRuleData: true,
        }
      });
      return new ServiceResponse('Listing house rules', houseRules, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error fetching listing house rules', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addHouseRuleToListing(listingId: string, houseRuleData: any) {
    try {
      const addedRule = await this.prisma.listingHasHouseRule.create({
        data: {
          listingId,
          ...houseRuleData
        },
        include: {
          houseRuleData: true,
        }
      });
      if (addedRule) {
        return new ServiceResponse('House rule added to listing', addedRule, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding house rule to listing', addedRule, false, 400, 'Error adding house rule', 'LISTING_SERVICE_ERROR_ADDING_LISTING_HOUSE_RULE', 'Check inputs, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding house rule to listing', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async setMultipleListingHouseRules(listingId: string, houseRuleData: any[]) {
    const listingHasHouseRuleData = houseRuleData
      .map((x) => ({
        listingId,
        isAllowed: !!x.isAllowed,
        description: x.description,
        houseRule: x.houseRule
      }));
    try {
      const setHouseRules = await this.prisma.listingHasHouseRule.createMany({
        data: listingHasHouseRuleData,
        skipDuplicates: true,
      });
      return new ServiceResponse('Listing House Rules set', setHouseRules, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting multiple listing house rules', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async listingHasHouseRule(listingId: string, houseRule: string) {
    try {
      const houseRuleExists = await this.prisma.listingHasHouseRule.findUnique({
        where: {
          listingId_houseRule: {
            listingId,
            houseRule,
          }
        },
        include: {
          houseRuleData: true,
        }
      });
      if (houseRuleExists) {
        return new ServiceResponse('House rule found', houseRuleExists, true, 200, null, null, null);
      }
      return new ServiceResponse('Listing does not have house rule', houseRuleExists, false, 404, 'House rule not found', 'LISTING_SERVICE_ERROR_LISTING_HOUSE_RULE_NOT_FOUND', 'Confirm listing has house rule');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting listing house rule', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async updateListingHouseRule(listingId: string, houseRule: string, houseRuleData: any) {
    try {
      const updatedListingHouseRule = await this.prisma.listingHasHouseRule.update({
        where: {
          listingId_houseRule: {
            listingId,
            houseRule
          }
        },
        data: {
          ...houseRuleData
        },
        include: {
          houseRuleData: true,
        }
      });
      if (updatedListingHouseRule) {
        return new ServiceResponse('Listing House Rule updated', updatedListingHouseRule, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating listing house rule', updatedListingHouseRule, false, 400, 'Error updating listing house rule', 'LISTING_SERVICE_ERROR_UPDATING_LISTING_HOUSE_RULE', 'Check inputs, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating listing house rule', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async removeListingHouseRule(listingId: string, houseRule: string) {
    try {
      const removedHouseRule = await this.prisma.listingHasHouseRule.delete({
        where: {
          listingId_houseRule: {
            listingId,
            houseRule
          }
        }
      });
      if (removedHouseRule) {
        return new ServiceResponse('House rule removed from listing', removedHouseRule, true, 200, null, null, null);
      }
      return new ServiceResponse('Error removing listing house rule', removedHouseRule, false, 400, 'Error removing house rule', 'LISTING_SERVICE_ERROR_REMOVING_LISTING_HOUSE_RULE', 'Check inputs, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error removing listing house rule', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async removeAllListingHouseRules(listingId: string) {
    try {
      const removedHouseRules = await this.prisma.listingHasHouseRule.deleteMany({
        where: {
          listingId
        }
      });
      if (removedHouseRules) {
        return new ServiceResponse('All listing house rules removed', removedHouseRules, true, 200, null, null, null);
      }
      return new ServiceResponse('Error removing all listing house rules', removedHouseRules, false, 400, 'Error deleting house rules', 'LISTING_SERVICE_ERROR_REMOVING_ALL_LISTING_HOUSE_RULES', 'Check logs and databases');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error removing all listing house rules', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getHouseRuleByKey(houseRule: string) {
    try {
      const rule = await this.prisma.houseRule.findUnique({
        where: {
          houseRule,
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          },
        }
      });
      if (rule) {
        return new ServiceResponse('House rule found', rule, true, 200, null, null, null);
      }
      return new ServiceResponse('House rule not found', null, false, 404, 'House rule not found', 'LISTING_SERVICE_HOUSE_RULE_NOT_FOUND', 'Check house rule and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting house rule', null, false, 500, error.message, error, 'Check database and logs');
    }
  }

  async createHouseRule(houseRuleData: any) {
    try {
      const houseRule = await this.prisma.houseRule.create({
        data: {
          ...houseRuleData
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          },
        }
      });
      if (houseRule) {
        return new ServiceResponse('House rule created', houseRule, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating House Rule', null, false, 404, 'House rule not created', 'LISTING_SERVICE_ERROR_CREATING_HOUSE_RULE', 'Check house rule and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating house rule', null, false, 500, error.message, error, 'Check database and logs');
    }
  }

  async updateHouseRule(houseRule: string, houseRuleData: any) {
    try {
      const updatedHouseRule = await this.prisma.houseRule.update({
        where: {
          houseRule
        },
        data: {
          ...houseRuleData
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          },
        }
      });
      if (updatedHouseRule) {
        return new ServiceResponse('House rule updated', updatedHouseRule, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating House Rule', null, false, 404, 'House rule not updated', 'LISTING_SERVICE_ERROR_UPDATING_HOUSE_RULE', 'Check house rule and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating house rule', null, false, 500, error.message, error, 'Check database and logs');
    }
  }

  async deleteHouseRule(houseRule: string) {
    try {
      const deletedHouseRule = await this.prisma.houseRule.delete({
        where: {
          houseRule
        },
        include: {
          _count: {
            select: {
              listings: true,
            }
          },
        }
      });
      if (deletedHouseRule) {
        return new ServiceResponse('House rule deleted', deletedHouseRule, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting House Rule', null, false, 404, 'House rule not deleted', 'LISTING_SERVICE_ERROR_DELETING_HOUSE_RULE', 'Check house rule and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting house rule', null, false, 500, error.message, error, 'Check database and logs');
    }
  }
}
