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

  async getRoomById(chatRoomId: string) {
    try {
      const room = await this.prisma.chatRoom.findUnique({
        where: {
          chatRoomId,
        }
      });
      if (room) {
        return new ServiceResponse('Room found', room, true, 200, null, null, null);
      }
      return new ServiceResponse('Room not found', room, false, 404, 'Chat Room not found', 'CHAT_SERVICE_CHATROOM_NOT_FOUND', 'Check room exists and room Id');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting room', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserParticipation(chatRoomId: string, userId: string) {
    try {
      const userParticipation = await this.prisma.chatParticipants.findFirst({
        where: {
          AND: [
            {
              chatRoomId
            },
            {
              userId,
            }
          ]
        }
      });
      if (userParticipation) {
        return new ServiceResponse('User participation exists', userParticipation, true, 200, null, null, null);
      }
      return new ServiceResponse('User is not participating in room', userParticipation, false, 404, 'User does not belong to chat room', 'CHAT_SERVICE_USER_NOT_IN_CHATROOM', 'Check user is participating in room');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user participation', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getMessageById(messageId: string) {
    try {
      const message = await this.prisma.chatMessage.findUnique({
        where: {
          messageId,
        }
      });
      if (message) {
        return new ServiceResponse('Message found', message, true, 200, null, null, null);
      }
      return new ServiceResponse('Message Not found', message, false, 200, 'Message not found', 'CHAT_SERVICE_ERROR_MESSAGE_NOT_FOUND', 'Check message exists, message Id, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting message', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserContacts(userId: string, page = 1, limit = 12) {
    try {
      const contacts = await this.prisma.chatRoom.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          participants: {
            some: {
              userId
            }
          }
        },
        include: {
          messages: {
            take: 1,
            orderBy: {
              createdAt: 'desc'
            },
            include: {
              user: true,
              replyToMessage: {
                include: {
                  user: true,
                }
              }
            }
          },
          groupChatSettings: true,
        },
        orderBy: {
          updatedAt: 'desc'
        }
      });
      const total = await this.prisma.chatParticipants.count({
        where: {
          userId
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('User Contacts', {
        pages, prev, next, total, data: contacts, page, limit
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user', null, false, 500, error.message, error);
    }
  }

  async searchUserContacts(userId: string, searchTerm: string, page = 1, limit = 12) {
    try {
      const contacts = await this.prisma.chatRoom.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId
                }
              }
            },
            {
              OR: [
                {
                  participants: {
                    some: {
                      user: {
                        OR: [
                          {
                            username: {
                              contains: searchTerm,
                              mode: 'insensitive',
                            },
                            displayname: {
                              contains: searchTerm,
                              mode: 'insensitive',
                            }
                          }
                        ]
                      }
                    }
                  },
                },
                {
                  groupChatSettings: {
                    OR: [
                      {
                        name: {
                          contains: searchTerm,
                          mode: 'insensitive'
                        },
                        description: {
                          contains: searchTerm,
                          mode: 'insensitive'
                        }
                      }
                    ]
                  }
                }
              ]
            }
          ]
        }
      });
      const total = await this.prisma.chatRoom.count({
        where: {
          AND: [
            {
              participants: {
                some: {
                  userId
                }
              }
            },
            {
              OR: [
                {
                  participants: {
                    some: {
                      user: {
                        OR: [
                          {
                            username: {
                              contains: searchTerm,
                              mode: 'insensitive',
                            },
                            displayname: {
                              contains: searchTerm,
                              mode: 'insensitive',
                            }
                          }
                        ]
                      }
                    }
                  },
                },
                {
                  groupChatSettings: {
                    OR: [
                      {
                        name: {
                          contains: searchTerm,
                          mode: 'insensitive'
                        },
                        description: {
                          contains: searchTerm,
                          mode: 'insensitive'
                        }
                      }
                    ]
                  }
                },
              ]
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('Searched User Contacts', {
        pages, prev, next, total, data: contacts, page, limit
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error searching user contacts', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createChatInvite(sentById: string, sentToId: string) {
    try {
      const chatInvite = await this.prisma.chatInvites.create({
        data: {
          sentById,
          sentToId
        },
        include: {
          sentBy: true,
          sentTo: true,
        }
      });
      if (chatInvite) {
        return new ServiceResponse('Chat invite created', chatInvite, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating chat invite', chatInvite, false, 400, 'Error creating Chat invite', 'CHAT_SERVICE_ERROR_CREATING_CHAT_INVITE', 'Check userIds, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating chat invite', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createPrivateContact(userAId: string, userBId: string) {
    try {
      const chatRoom = await this.prisma.chatRoom.create({
        data: {
          type: 'PRIVATE',
        }
      });
      await this.prisma.chatParticipants.createMany({
        data: [
          {
            chatRoomId: chatRoom.chatRoomId,
            userId: userAId,
          },
          {
            chatRoomId: chatRoom.chatRoomId,
            userId: userBId,
          },
        ]
      });
      const newContact = await this.prisma.chatRoom.findUnique({
        where: {
          chatRoomId: chatRoom.chatRoomId
        },
        include: {
          participants: {
            include: {
              user: true,
            }
          },
          groupChatSettings: true,
        }
      });
      if (newContact) {
        return new ServiceResponse('Contact created', newContact, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating contact', newContact, false, 400, 'Error creating contact', 'CHAT_SERVICE_ERROR_CREATING_CONTACT', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating private contact', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createGroupChat(userId: string) {
    try {
      const room = await this.prisma.chatRoom.create({
        data: {
          type: 'GROUP',
          public: true,
        }
      });
      await this.prisma.chatParticipants.create({
        data: {
          chatRoomId: room.chatRoomId,
          userId,
        }
      });
      await this.prisma.groupChatSettings.create({
        data: {
          chatRoomId: room.chatRoomId,
          createdById: userId,
          groupAdmins: {
            set: [userId]
          }
        }
      });
      const newGroupChat = await this.prisma.chatRoom.findUnique({
        where: {
          chatRoomId: room.chatRoomId,
        },
        include: {
          participants: {
            include: {
              user: true,
            }
          },
          groupChatSettings: true
        }
      });
      if (newGroupChat) {
        return new ServiceResponse('New Group Chat created', newGroupChat, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating group chat', newGroupChat, false, 400, 'Error creating group chat', 'CHAT_SERVICE_ERROR_CREATING_GROUP_CHAT', 'Check inputs, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating Group Chat', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async addUserToGroupChat(chatRoomId: string, userId: string) {
    try {
      const newChatParticipant = await this.prisma.chatParticipants.create({
        data: {
          chatRoomId,
          userId,
        },
        include: {
          chatRoom: {
            include: {
              groupChatSettings: true,
            }
          },
          user: true,
        }
      });
      if (newChatParticipant) {
        return new ServiceResponse('User added to group chat', newChatParticipant, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding user to chat group', newChatParticipant, false, 200, 'Error adding user to chat group', 'CHAT_SERVICE_ERROR_ADDING_USER_TO_CHAT_GROUP', 'Check userId, group chat Id, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding user to chat group', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
