import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse,
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class AdminDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getAllListings(page = 1, limit = 20) {
    try {
      const listings = await this.prisma.listing.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          images: {
            orderBy: {
              order: 'asc'
            }
          },
          _count: {
            select: {
              amenities: true,
              images: true,
              houseRules: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      const total = await this.prisma.listing.count();
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('User Published listings', {
        total, listings, page, pages, limit, prev, next
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting listings', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserListings(userId: string, page = 1, limit = 20) {
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
              images: true,
              houseRules: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      const total = await this.prisma.listing.count();
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('User Published listings', {
        total, listings, page, pages, limit, prev, next
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user listings', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchListings(filters: any, page = 1, limit = 20) {
    try {
      const listings = await this.prisma.listing.findMany({
        where: {
          ...filters
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
              images: true,
              houseRules: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
      const total = await this.prisma.listing.count({
        where: {
          ...filters
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('Search listings results', {
        total, listings, page, pages, limit, prev, next, search: filters
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error searching listings', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
