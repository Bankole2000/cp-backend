import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export default class NotificationDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getUserNotificationSettings(userId: string) {
    try {
      const notificationSettings = await this.prisma.userNotificationSettings.findUnique({
        where: {
          userId,
        }
      });
      if (notificationSettings) {
        return new ServiceResponse('User notification settings', notificationSettings, true, 200, null, null, null);
      }
      const newNotificationSettings = await this.prisma.userNotificationSettings.create({
        data: {
          userId,
        }
      });
      if (newNotificationSettings) {
        return new ServiceResponse('User notification settings', newNotificationSettings, true, 200, null, null, null);
      }
      return new ServiceResponse('Error getting user notification settings', newNotificationSettings, false, 400, 'Error getting user notification settings', 'NOTIFICATION_SERVICE_ERROR_GETTING_USER_NOTIFICATION_SETTINGS', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user notification settings', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserPreviousNotifications(userId: string, from: string, limit = 12) {
    try {
      const notifications = await this.prisma.userNotifications.findMany({
        take: limit,
        where: {
          AND: [
            {
              userId,
            },
            {
              notification: {
                createdAt: {
                  lte: from,
                }
              },
            }
          ]
        },
        include: {
          notification: true,
        }
      });
      const total = await this.prisma.userNotifications.count({
        where: {
          userId,
        }
      });
      return new ServiceResponse('User previous notifications', { total, notifications }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user previous notifications', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserNextNotifications(userId: string, from: string, limit = 12) {
    try {
      const notifications = await this.prisma.userNotifications.findMany({
        take: limit,
        where: {
          AND: [
            {
              userId,
            },
            {
              notification: {
                createdAt: {
                  gt: from
                }
              }
            }
          ]
        },
        include: {
          notification: true,
        }
      });
      const total = await this.prisma.userNotifications.count({
        where: {
          userId,
        }
      });
      return new ServiceResponse('User next notifications', { total, notifications }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user next notifications', null, false, 500, error.message, error, 'Check logs and database');
    }
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
      return new ServiceResponse('Error setting user followers', updatedUser, false, 400, 'Error setting user followers', 'NOTIFICATION_SERVICE_ERROR_SETTING_USER_FOLLOWERS', 'Check user id, follower list, logs and database');
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
      return new ServiceResponse('Error setting user following', updatedUser, false, 400, 'Error setting user following', 'NOTIFICATION_SERVICE_ERROR_SETTING_USER_FOLLOWING', 'Check user id, following list, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error setting user following', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createUserNotification(userId: string, notificationData: any) {
    try {
      const notification = await this.prisma.notification.create({
        data: {
          ...notificationData
        }
      });
      if (!notification) {
        return new ServiceResponse('Error creating notification', notification, false, 400, 'Error creating notification', 'NOTIFICATION_SERVICE_ERROR_CREATING_NOTIFICATION', 'Check input, logs and database');
      }
      const userNotification = await this.prisma.userNotifications.create({
        data: {
          userId,
          notificationId: notification.id,
          seen: false,
        },
        include: {
          notification: true,
        }
      });
      if (userNotification) {
        return new ServiceResponse('User notification created', userNotification, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating user notification', userNotification, false, 400, 'Error creating notification', 'NOTIFICATION_SERVICE_ERROR_CREATING_NOTIFICATION', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating user notification', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkNotificationAlreadyExists(
    userId: string,
    type: any,
    message: any,
    resourceType: any,
    resourceId: any
  ) {
    try {
      const notification = await this.prisma.userNotifications.findFirst({
        where: {
          AND: [
            {
              userId,
            },
            {
              notification: {
                resourceId,
                message,
                type,
                resourceType,
              }
            }
          ],
        },
        include: {
          notification: true,
        }
      });
      if (notification) {
        return new ServiceResponse('Notification exists', notification, true, 200, null, null, null);
      }
      return new ServiceResponse('Notification not found', notification, false, 404, 'Notification not found', 'NOTIFICATION_SERVICE_NOTIFICATION_NOT_FOUND', 'Check inputs, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting notification', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async markAllUserNotificationsAsSeen(userId: string) {
    try {
      const seen = await this.prisma.userNotifications.updateMany({
        where: {
          userId,
        },
        data: {
          seen: true,
        }
      });
      if (seen.count) {
        return new ServiceResponse('Notifications marked as seen', seen, true, 200, null, null, null);
      }
      return new ServiceResponse('No unseen notifications', seen, false, 404, 'No unseen notifications', 'NOTIFICATION_SERVICE_UNSEEN_NOTIFICATIONS_NOT_FOUND', 'No need to fix');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error marking notifications as seen', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async markAllUserNotificationsAsRead(userId: string) {
    try {
      const read = await this.prisma.userNotifications.updateMany({
        where: {
          userId,
        },
        data: {
          read: true,
          seen: true,
        }
      });
      if (read.count) {
        return new ServiceResponse('Notifications marked as read', read, true, 200, null, null, null);
      }
      return new ServiceResponse('No unread notifications', read, false, 404, 'No unread notifications', 'NOTIFICATION_SERVICE_UNREAD_NOTIFICATIONS_NOT_FOUND', 'No need to fix');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error marking notifications as read', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    try {
      const read = await this.prisma.userNotifications.update({
        where: {
          notificationId_userId: {
            notificationId,
            userId,
          }
        },
        data: {
          read: true,
        },
        include: {
          notification: true
        }
      });
      if (read) {
        return new ServiceResponse('Notification marked as read', read, true, 200, null, null, null);
      }
      return new ServiceResponse('Error marking notification as read', read, false, 400, 'Error marking notification as read', 'NOTIFICATION_SERVICE_ERROR_MARKING_NOTIFICATION_AS_READ', 'Check notification and userId, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error marking notification as read', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
