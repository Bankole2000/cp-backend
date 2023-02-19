import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export default class AdminDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getAllUserProfiles(page = 1, limit = 10) {
    try {
      const profiles = await this.prisma.profile.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      });
      const total = await this.prisma.profile.count({});
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('User Published listings', {
        total, profiles, page, pages, limit, prev, next
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user profiles', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
