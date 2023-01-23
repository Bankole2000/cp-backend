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
