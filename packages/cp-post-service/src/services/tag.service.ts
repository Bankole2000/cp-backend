import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse, RedisConnection
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class TagDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getLikedIds(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        userId,
      },
      include: {
        savedPosts: true,
        userLikedPosts: true,
        posts: true,
        reportedPosts: true,
        viewed: true,
      }
    });
    if (user) {
      const followingIds = user.following.length ? user.following : [];
      const followerIds = user.followers.length ? user.followers : [];
      const savedIds = user.savedPosts.length ? user.savedPosts.map((x) => x.postId) : [];
      const repostIds = user.posts.length
        ? user.posts.filter((x) => x.repostId !== null).map((x) => x.repostId) : [];
      const reportedIds = user.reportedPosts.length ? user.reportedPosts.map((x) => x.postId) : [];
      const viewedIds = user.viewed.length ? user.viewed.map((x) => x.postId) : [];
      return {
        followingIds,
        followerIds,
        savedIds,
        repostIds,
        reportedIds,
        viewedIds
      };
    }
    return {
      followingIds: [],
      followerIds: [],
      savedIds: [],
      repostIds: [],
      reportedIds: [],
      viewedIds: []
    };
  }

  async getTagPosts(
    tag: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const posts = await this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          tags: {
            some: {
              name: tag,
            }
          }
        },
        include: {
          createdByData: true,
          postMedia: {
            orderBy: {
              order: 'asc'
            }
          },
          moderation: true,
          repost: {
            include: {
              createdByData: {
                select: {
                  displayname: true,
                  username: true,
                }
              },
              postMedia: {
                orderBy: {
                  order: 'asc'
                }
              },
              moderation: true,
              _count: {
                select: {
                  likedBy: true,
                  comments: true,
                  postMedia: true,
                  views: true,
                  reposts: true,
                }
              }
            }
          },
          _count: {
            select: {
              likedBy: true,
              comments: true,
              postMedia: true,
              views: true,
              reposts: true,
            }
          },
          tags: true,
        },
      });
      const total = await this.prisma.post.count({
        where: {
          tags: {
            some: {
              name: tag,
            }
          }
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (posts.length && loggedInUserId) {
        const {
          followerIds, followingIds, reportedIds, repostIds, savedIds, viewedIds
        } = await this.getLikedIds(loggedInUserId);
        data = posts.map((post) => ({
          ...post,
          followsYou: followingIds.length ? followingIds.includes(post.createdBy) : false,
          followedByYou: followerIds.length ? followerIds.includes(post.createdBy) : false,
          reportedByYou: reportedIds.length ? reportedIds.includes(post.id) : false,
          savedByYou: savedIds.length ? savedIds.includes(post.id) : false,
          repostedByYou: repostIds.length ? repostIds.includes(post.id) : false,
          viewedByYou: viewedIds.length ? viewedIds.includes(post.id) : false,
          authoredByYou: post.repostId
            ? post.repost?.createdBy === loggedInUserId
            : post.createdBy === loggedInUserId
        }));
      } else {
        data = posts;
      }
      return new ServiceResponse(
        'User Posts',
        {
          total, data, page, pages, limit, prev, next
        },
        true,
        200,
        null,
        null,
        null,
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting tag posts', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getTags(page = 1, limit = 12) {
    try {
      const tags = await this.prisma.tag.findMany({
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        }
      });
      const total = await this.prisma.tag.count({});
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('Tags', {
        total,
        page,
        pages,
        limit,
        prev,
        next,
        data: tags,
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting Tags', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchTags(searchTerm: string, page = 1, limit = 12) {
    try {
      const tags = await this.prisma.tag.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          name: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        include: {
          _count: {
            select: {
              posts: true
            }
          }
        },
        orderBy: {
          posts: {
            _count: 'desc'
          }
        }
      });
      const total = await this.prisma.tag.count({});
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('Tags', {
        total,
        page,
        pages,
        limit,
        prev,
        next,
        data: tags,
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting Tags', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
