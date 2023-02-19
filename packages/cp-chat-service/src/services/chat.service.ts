import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse, RedisConnection
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class ChatDBService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  async purgeAllUserParticipations(userId: string) {
    try {
      const userMessages = await this.prisma.chatMessage.findMany({
        where: {
          userId
        }
      });
      const messageIds = userMessages.map((message) => message.messageId);
      await this.prisma.media.deleteMany({
        where: {
          messageId: {
            in: messageIds
          }
        }
      });
      await this.prisma.reaction.deleteMany({
        where: {
          OR: [
            {
              messageId: {
                in: messageIds
              },
              userId
            }
          ]
        }
      });
      await this.prisma.messageDeliveredTo.deleteMany({
        where: {
          userId,
        }
      });
      await this.prisma.messageSeenBy.deleteMany({
        where: {
          userId,
        }
      });
      await this.prisma.chatMessage.deleteMany({
        where: {
          messageId: {
            in: messageIds
          }
        }
      });
      await this.prisma.chatInvites.deleteMany({
        where: {
          OR: [
            {
              sentById: userId
            },
            {
              sentToId: userId
            }
          ]
        }
      });
      const result = await this.prisma.chatParticipants.deleteMany({
        where: {
          userId
        }
      });
      if (result.count) {
        return new ServiceResponse('User participations purged successfully', null, true, 200, null, null, null);
      }
      return new ServiceResponse('No User participations found', null, true, 404, null, 'CHAT_SERVICE_NO_USER_PARTICIPATIONS_TO_PURGE', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error purging user participations', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async purgeUserAccount(userId: string) {
    try {
      const deletedChatResult = await this.purgeAllUserParticipations(userId);
      if (!deletedChatResult.success) {
        return deletedChatResult;
      }
      const result = await this.prisma.user.delete({
        where: {
          userId
        }
      });
      if (result) {
        return new ServiceResponse('User account purged successfully', null, true, 200, null, null, null);
      }
      return new ServiceResponse('User account not found', null, true, 404, null, 'CHAT_SERVICE_USER_ACCOUNT_NOT_FOUND', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error purging user account', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserContacts(userId: string) {
    try {
      const contacts = await this.prisma.chatParticipants.findMany({
        where: {
          userId
        },
        include: {
          chatRoom: {
            include: {
              messages: {
                take: 1,
                orderBy: {
                  createdAt: 'desc'
                },
                include: {
                  user: true,
                }
              },
              groupChatSettings: true,
            }
          }
        }
      });
      return new ServiceResponse('User Contacts', contacts, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user', null, false, 500, error.message, error);
    }
  }

  // async createChatInvite(senderId: string, recieverId: string)
}
