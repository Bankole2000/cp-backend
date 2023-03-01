import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { PrismaClient, ReportReason } from '@prisma/client';

import prisma from '../lib/prisma';
import { moderationStatus } from '../utils/common';

export default class ModerationDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  // TODO: cancelAutoModeration () {}

  async moderationPosts(page = 1, limit = 12) {
    try {
      const queue = await this.prisma.moderationQueue.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          OR: [
            {
              status: moderationStatus.AUTO_APPROVED
            },
            {
              status: moderationStatus.PENDING
            }
          ]
        },
        include: {
          _count: {
            select: {
              moderation: true,
              reports: true,
            }
          },
          post: {
            include: {
              postMedia: true,
              _count: {
                select: {
                  comments: true,
                  likedBy: true,
                  postMedia: true,
                  tags: true,
                  views: true,
                }
              }
            }
          },
          moderation: true,
          reports: true,
        }
      });
      const total = await this.prisma.moderationQueue.count({
        where: {
          OR: [
            {
              status: moderationStatus.AUTO_APPROVED
            },
            {
              status: moderationStatus.PENDING
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('Posts in moderation queue', {
        total, queue, page, pages, limit, prev, next
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting posts', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createModerationReview(postId: string, status: string, comments = '', reviewedBy: string | null = null, rejected = false, rejectionReason: string | null = null, contentWarning = false) {
    try {
      const moderationReview = await this.prisma.moderationQueue.update({
        data: {
          status,
          moderated: true,
          contentWarning,
          moderation: {
            create: {
              actionTaken: status,
              rejected,
              rejectionReason: rejected ? rejectionReason : null,
              reviewedBy,
              comments,
            }
          }
        },
        where: {
          postId,
        },
        include: {
          post: {
            include: {
              _count: {
                select: {
                  comments: true,
                  likedBy: true,
                  postMedia: true,
                  tags: true,
                  views: true,
                }
              },
              postMedia: {
                orderBy: {
                  order: 'asc'
                }
              }
            }
          },
          moderation: true,
          reports: true,
        }
      });
      if (moderationReview) {
        return new ServiceResponse('Moderation Review Added', moderationReview, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding moderation review', moderationReview, false, 400, 'Error adding moderation review', 'POST_SERVICE_ERROR_ADDING_MODERATION_REVIEW', 'Check input data, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating moderation review', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getModerationDetails(postId: string) {
    try {
      const moderationDetails = await this.prisma.moderationQueue.findUnique({
        where: {
          postId,
        },
        include: {
          moderation: true,
          post: true,
          reports: true,
        }
      });
      if (moderationDetails) {
        return new ServiceResponse('Moderation details found', moderationDetails, true, 200, null, null, null);
      }
      return new ServiceResponse('Moderation Details not found', moderationDetails, false, 404, 'Error finding post moderation details', 'POST_SERVICE_ERROR_MODERATION_DETAILS_NOT_FOUND', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post moderation details', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
