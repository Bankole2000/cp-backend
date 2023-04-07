import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse,
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class CurrentUserDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getAllUserListings(userId: string, page = 1, limit = 20) {
    try {
      const listings = await this.prisma.listing.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          createdBy: userId
        },
        include: {
          images: {
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              amenities: true,
              houseRules: true,
              images: true,
            }
          }
        }
      });
      const total = await this.prisma.listing.count({
        where: {
          createdBy: userId
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('All User listings', {
        total, pages, prev, next, page, limit, listings,
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user listings', null, false, 500, error.messsage, error, 'Check logs and database');
    }
  }

  async getUserPublishedListings(userId: string, page = 1, limit = 20) {
    try {
      const listings = await this.prisma.listing.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          createdBy: userId,
          isPublished: true,
        },
        include: {
          images: {
            orderBy: {
              order: 'asc'
            }
          },
        }
      });
      const total = await this.prisma.listing.count({
        where: {
          createdBy: userId,
          isPublished: true,
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('User Published listings', {
        total, listings, page, pages, limit, prev, next
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user published listings', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
