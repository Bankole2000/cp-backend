import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse, RedisConnection
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class FeedDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async setFollowers(userId: string, followers: string[]) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          followers: {
            set: followers,
          }
        }
      });
      if (updatedUser) {
        return new ServiceResponse('User followers set', updatedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('Error setting user followers', updatedUser, false, 400, 'Error setting user followers', 'FEED_SERVICE_ERROR_SETTING_USER_FOLLOWERS', 'Check user id, follower list, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting user followers', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async setFollowing(userId: string, following: string[]) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          following: {
            set: following,
          }
        }
      });
      if (updatedUser) {
        return new ServiceResponse('User following set', updatedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('Error setting user following', updatedUser, false, 400, 'Error setting user following', 'FEED_SERVICE_ERROR_SETTING_USER_FOLLOWING', 'Check user id, following list, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting user following', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addFollowers(followingData: any) {
    try {
      const addFollower = await this.prisma.user.update({
        where: {
          userId: followingData.followingId,
        },
        data: {
          followers: {
            push: followingData.followerId,
          }
        }
      });
      const addFollowing = await this.prisma.user.update({
        where: {
          userId: followingData.followerId,
        },
        data: {
          following: {
            push: followingData.followingId,
          }
        }
      });
      const serviceResponse = new ServiceResponse(
        'User follower added',
        { addFollower, addFollowing },
        true,
        200,
        null,
        null
      );
      return serviceResponse;
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating following', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async removeFollowers(followingData: any) {
    try {
      const theFollowed = await this.prisma.user.findUnique({
        where: {
          userId: followingData.followingId,
        },
      });
      const theFollower = await this.prisma.user.findUnique({
        where: {
          userId: followingData.followerId,
        },
      });
      if (theFollowed?.followers.includes(followingData.followerId)) {
        theFollowed.followers = theFollowed
          .followers.filter((x) => x !== followingData.followerId);
      }
      if (theFollower?.following.includes(followingData.followingId)) {
        theFollower.following = theFollower
          .following.filter((x) => x !== followingData.followingId);
      }
      let removeUserFollower;
      let removeUserFollowing;
      if (theFollowed) {
        removeUserFollower = await this.prisma.user.update({
          where: {
            userId: theFollowed?.userId,
          },
          data: {
            followers: {
              set: theFollowed?.followers,
            },
          },
        });
      }
      if (theFollower) {
        removeUserFollowing = await this.prisma.user.update({
          where: {
            userId: theFollower?.userId,
          },
          data: {
            following: {
              set: theFollower?.following,
            },
          },
        });
      }
      const serviceResponse = new ServiceResponse(
        'User follower removed',
        { removeUserFollower, removeUserFollowing },
        true,
        200,
        null,
        null
      );
      return serviceResponse;
    } catch (error: any) {
      console.log({ error });
      const serviceResponse = new ServiceResponse('Error adding User follower', null, false, 500, error.message, error);
      return serviceResponse;
    }
  }
}
