import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse, RedisConnection
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class UserDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async createUser(userData: any) {
    try {
      const createdUser = await this.prisma.user.create({
        data: { ...userData },
      });
      if (createdUser) {
        return new ServiceResponse('User created successfully', createdUser, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to create User', createdUser, false, 400, 'Failed to create User', 'CHAT_SERVICE_ERROR_CREATING_USER', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating User', null, false, 500, error.message, error, null);
    }
  }

  async findUserById(userId: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          userId,
        },
      });
      if (user) {
        return new ServiceResponse('User found successfully', user, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', user, false, 404, 'User not found', 'CHAT_SERVICE_USER_BY_ID_NOT_FOUND', 'Confirm that user exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding User', null, false, 500, error.message, error, 'Check logs and database');
    }
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
      const blockedIds = user.blocked.length ? user.blocked : [];
      const blockedByIds = user.blockedBy.length ? user.blockedBy : [];
      const savedIds = user.savedPosts.length ? user.savedPosts.map((x) => x.postId) : [];
      const repostIds = user.posts.length
        ? user.posts.filter((x) => !!x.repostId).map((x) => x.repostId) : [];
      const reportedIds = user.reportedPosts.length ? user.reportedPosts.map((x) => x.postId) : [];
      const viewedIds = user.viewed.length ? user.viewed.map((x) => x.postId) : [];
      const likedIds = user.userLikedPosts.length ? user.userLikedPosts.map((x) => x.postId) : [];
      return {
        followingIds,
        followerIds,
        blockedIds,
        blockedByIds,
        savedIds,
        repostIds,
        reportedIds,
        viewedIds,
        likedIds,
      };
    }
    return {
      followingIds: [],
      followerIds: [],
      blockedIds: [],
      blockedByIds: [],
      savedIds: [],
      repostIds: [],
      reportedIds: [],
      viewedIds: [],
      likedIds: [],
    };
  }

  async updateUser(userId: string, userData: any) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          userId,
        },
        data: { ...userData },
      });
      if (updatedUser) {
        return new ServiceResponse('User updated successfully', updatedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating user', updatedUser, false, 400, 'Error updating User', 'CHAT_SERVICE_ERROR_UPDATING_USER', 'Check fields, service logs and db');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async findUserByUsername(username: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          username,
        },
      });
      if (user) {
        return new ServiceResponse('User found successfully', user, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', user, false, 404, 'User not found', 'AUTH_SERVICE_USER_BY_USERNAME_NOT_FOUND', 'Confirm the username and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUsersByRoles(roles: string[]) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          roles: {
            hasSome: roles
          }
        }
      });
      return new ServiceResponse('Users with specified roles', users, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting users by role(s)', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  static async getUserSession(redis: RedisConnection, scope: string, sessionId: string) {
    try {
      await redis.client.connect();
      const session = await redis.client.hGet(`${scope}-logged-in`, sessionId);
      await redis.client.disconnect();
      return session;
    } catch (error: any) {
      console.log({ error });
      return null;
    }
  }

  async purgeUserAccount(userId: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: {
          userId,
        },
      });
      if (deletedUser) {
        return new ServiceResponse('User deleted successfully', deletedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', deletedUser, false, 404, 'User not found', 'CHAT_SERVICE_USER_BY_ID_NOT_FOUND', 'Confirm that user exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserPublishedPosts(
    userId: string,
    page = 1,
    limit = 20,
    loggedInUserId: string | null = null
  ) {
    try {
      const posts = await this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              createdBy: userId,
            },
            {
              published: true,
            }
          ]
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
                }
              },
              repost: {
                include: {
                  createdByData: {
                    select: {
                      displayname: true,
                      username: true,
                    }
                  },
                  postMedia: {
                    take: 1,
                    orderBy: {
                      order: 'asc'
                    }
                  },
                }
              },
              likedBy: true,
            }
          },
          comments: {
            take: 1,
            where: {
              pinned: true
            },
            include: {
              author: true
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
        orderBy: [
          {
            pinned: 'asc'
          },
          {
            created: 'desc'
          }
        ]
      });
      const promises: any[] = [];
      posts.forEach((p) => {
        const isRepost = p.repostId && !p.caption && !p.postMedia.length;
        if (isRepost) {
          promises.push(this.prisma.post.count({ where: { repostId: p.repostId } }));
        } else {
          promises.push(this.prisma.post.count({ where: { repostId: p.id } }));
        }
      });
      const repostCount = await Promise.all(promises);
      const total = await this.prisma.post.count({
        where: {
          AND: [
            {
              createdBy: userId,
            },
            {
              published: true,
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (posts.length && loggedInUserId) {
        const {
          followerIds, followingIds, reportedIds, repostIds, savedIds, viewedIds, likedIds
        } = await this.getLikedIds(loggedInUserId);
        data = posts.map((post, i) => {
          const isRepost = post.repostId && !post.caption && !post.postMedia.length;
          return {
            ...post,
            followsYou: !isRepost
              ? followingIds.includes(post.createdBy)
              : followingIds.includes(post.repost?.createdBy as string),
            followedByYou: !isRepost
              ? followerIds.includes(post.createdBy)
              : followerIds.includes(post.repost?.createdBy as string),
            reportedByYou: reportedIds.length
              ? reportedIds.includes(isRepost ? post.repostId as string : post.id)
              : false,
            savedByYou: savedIds.length
              ? savedIds.includes(isRepost ? post.repostId as string : post.id)
              : false,
            repostCount: repostCount[i],
            repostedByYou:
              (post.repostId && post.postMedia.length)
                || (post.repostId && post.caption)
                || !post.repostId
                ? repostIds.includes(post.id) : repostIds.includes(post.repostId),
            viewedByYou: viewedIds.length
              ? viewedIds.includes(isRepost ? post.repostId as string : post.id)
              : false,
            likedByYou: (post.repostId && post.postMedia.length)
              || (post.repostId && post.caption)
              || !post.repostId
              ? likedIds.includes(post.id) : likedIds.includes(post.repostId),
            authoredByYou: post.repostId
              ? post.repost?.createdBy === loggedInUserId
              : post.createdBy === loggedInUserId
          };
        });
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
      return new ServiceResponse('Error getting user posts', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async countUnpublishedPosts(userId: string) {
    try {
      const unpublished = await this.prisma.post.count({
        where: {
          AND: [
            {
              createdBy: userId,
            },
            {
              published: false,
            }
          ]
        }
      });
      console.log({ unpublished });
      return unpublished;
    } catch (error: any) {
      console.log({ error });
      return null;
    }
  }

  async getAllUserPosts(userId: string, page = 1, limit = 12) {
    try {
      const posts = await this.prisma.post.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          createdBy: userId
        },
        include: {
          _count: {
            select: {
              comments: true,
              likedBy: true,
              postMedia: true,
              reposts: true,
              savedPosts: true,
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
      });
      const total = await this.prisma.post.count({
        where: {
          createdBy: userId
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse(
        'All user posts',
        {
          data: posts, total, prev, pages, page, limit, next
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user posts', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getRepostCount(postId: string) {
    try {
      const repostCount = await this.prisma.post.count({
        where: {
          repostId: postId,
        }
      });
      return new ServiceResponse('Repost count', { count: repostCount, postId }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting post repost count', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
