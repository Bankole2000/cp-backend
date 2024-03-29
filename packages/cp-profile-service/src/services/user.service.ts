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
      const createdUser = await this.prisma.profile.create({
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

  async updateUser(userId: string, userData: any) {
    try {
      const updatedUser = await this.prisma.profile.update({
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

  async updateUserProfileImage(userId: string, imageUrl: string) {
    try {
      const updatedUser = await this.prisma.profile.update({
        where: {
          userId,
        },
        data: {
          imageUrl,
        },
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

  async updateUserWallpaperImage(userId: string, wallpaperUrl: string) {
    try {
      const updatedUser = await this.prisma.profile.update({
        where: {
          userId,
        },
        data: {
          wallpaperUrl,
        },
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

  async getProfileByUserId(userId: string) {
    try {
      const user = await this.prisma.profile.findUnique({
        where: {
          userId,
        },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      });
      if (user) {
        return new ServiceResponse('User found successfully', user, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', user, false, 404, 'User not found', 'PROFILE_SERVICE_USER_BY_ID_NOT_FOUND', 'Confirm that user exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async findUserById(userId: string) {
    try {
      const user = await this.prisma.profile.findUnique({
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

  async findUserByUsername(username: string) {
    try {
      const user = await this.prisma.profile.findUnique({
        where: {
          username,
        },
        include: {
          profileSettings: true,
        }
      });
      if (user) {
        return new ServiceResponse('User found successfully', user, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', user, false, 404, 'User not found', 'PROFILE_SERVICE_USER_BY_USERNAME_NOT_FOUND', 'Confirm the username and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding User', null, false, 500, error.message, error, 'Check logs and database');
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

  async checkUserBlocked(blockedById: string, blockedId: string) {
    try {
      const blockedUser = await this.prisma.blocked.findUnique({
        where: {
          blockedById_blockedId: {
            blockedById,
            blockedId,
          }
        }
      });
      if (blockedUser) {
        return new ServiceResponse('User blocked', blockedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('User not blocked', blockedUser, false, 404, 'User block not found', 'PROFILE_SERVICE_USER_BLOCK_NOT_FOUND', 'If blocked, check block was stored properly');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting blocked user', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async purgeUserAccount(userId: string) {
    try {
      const deletedUser = await this.prisma.profile.delete({
        where: {
          userId,
        },
      });
      if (deletedUser) {
        return new ServiceResponse('User deleted successfully', deletedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting user', deletedUser, false, 500, 'Error deleting user', 'PROFILE_SERVICE_ERROR_DELETING_USER', 'Check the logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
