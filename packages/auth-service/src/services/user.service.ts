import { PrismaClient } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse, getAdjectives, RedisConnection
} from '@cribplug/common';
import prisma from '../lib/prisma';
import { desanitizeData, resanitizeData, userSoftDeleteFields } from '../schema/user.schema';

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
      return new ServiceResponse('Failed to create User', createdUser, false, 400, 'Failed to create User', 'AUTH_SERVICE_ERROR_CREATING_USER', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          email,
        },
      });
      if (user) {
        return new ServiceResponse('User found successfully', user, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', user, false, 200, 'User not found', 'AUTH_SERVICE_USER_BY_EMAIL_NOT_FOUND', 'Confirm that user exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async findUserByPhoneNumber(phone: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: {
          phone,
        },
      });
      if (user) {
        return new ServiceResponse('User found successfully', user, true, 200, null, null, null);
      }
      return new ServiceResponse('User not found', user, false, 200, 'User not found', 'AUTH_SERVICE_USER_BY_PHONE_NUMBER_NOT_FOUND', 'Confirm that user exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async setUserRoles(userId: string, roles: string[]) {
    try {
      const user = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          roles: {
            set: roles,
          },
        },
      });
      if (user) {
        return new ServiceResponse('User role(s) set successfully', user, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to add role to User', user, false, 400, 'Failed to add role to User', 'AUTH_SERVICE_ERROR_ADDING_USER_ROLE', 'Check all fields and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding role to User', null, false, 500, error.message, error, 'Check logs and database');
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
      return new ServiceResponse('User not found', user, false, 404, 'User not found', 'AUTH_SERVICE_USER_BY_ID_NOT_FOUND', 'Confirm that user exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding User', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async updateUser(userId: string, userData: any) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          userId,
        },
        data: {
          ...userData,
          version: {
            increment: 1
          }
        },
      });
      if (updatedUser) {
        return new ServiceResponse('User updated successfully', updatedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('Error updating user', updatedUser, false, 500, 'Error updating user', 'AUTH_SERVICE_ERROR_UPDATING_USER', 'Check the logs and database');
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

  async generateUsernameSuggestions(username: string, userId: string) {
    let suggestions: string[] = [];
    const { data: user } = await this.findUserById(userId);
    const randomNumber = Math.floor(Math.random() * 1000 + 1);
    const currentYear = new Date().getFullYear();
    const birthYear = new Date(user?.dob).getFullYear();
    const adjectives = getAdjectives();
    const randAdj1 = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randAdj2 = adjectives[Math.floor(Math.random() * adjectives.length)];
    suggestions = [
      `${username}${randomNumber}`,
      `${username}_${currentYear}`,
      `${username}${birthYear}`,
      `${username}_the_${randAdj1}`,
      `${randAdj2}_${username}`,
    ];
    return suggestions;
  }

  async addApprovedDevice(userId: string, deviceData: any) {
    try {
      const approvedDevice = await this.prisma.approvedDevices.create({
        data: {
          ...deviceData,
          userId,
        },
      });
      if (approvedDevice) {
        return new ServiceResponse('Device added successfully', approvedDevice, true, 200, null, null, null);
      }
      return new ServiceResponse('Error adding device', approvedDevice, false, 500, 'Error adding device', 'AUTH_SERVICE_ERROR_ADDING_DEVICE', 'Check the logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error adding device', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async findDeviceById(deviceId: string) {
    try {
      const device = await this.prisma.approvedDevices.findFirst({
        where: {
          deviceId
        }
      });
      if (device) {
        return new ServiceResponse('Device Found', device, true, 200, null, null, null);
      }
      return new ServiceResponse('Device Not Found', null, false, 404, 'Device Not Found', 'AUTH_SERVICE_DEVICE_NOT_FOUND', 'Check device Id and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding device by Id', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async updateDeviceById(deviceId: string, deviceData: any) {
    try {
      const updatedDevice = await this.prisma.approvedDevices.update({
        where: {
          deviceId,
        },
        data: {
          ...deviceData
        }
      });
      if (updatedDevice) {
        return new ServiceResponse('Device Data Updated', updatedDevice, true, 201, null, null, null);
      }
      return new ServiceResponse('Error updating Device', null, false, 400, 'Error updating Device data', 'AUTH_SERVICE_ERROR_UPDATING_DEVICE', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating device by Id', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkIfDeviceIsApproved(userId: string, ip: string) {
    try {
      const approvedDevice = await this.prisma.approvedDevices.findFirst({
        where: {
          userId,
          ip,
        },
      });
      if (approvedDevice) {
        return new ServiceResponse('Device found', approvedDevice, true, 200, null, null, null);
      }
      return new ServiceResponse('Device not registered', approvedDevice, false, 404, 'Device not found', 'AUTH_SERVICE_DEVICE_NOT_FOUND', 'Add device to trusted devices');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding device', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createDevicePendingApproval(userId: string, deviceData: any) {
    try {
      const devicePendingApproval = await this.prisma.approvedDevices.create({
        data: {
          ...deviceData,
          active: false,
          banned: false,
        }
      });
      if (devicePendingApproval) {
        return new ServiceResponse('Device approval request created', devicePendingApproval, true, 200, null, null, null);
      }
      return new ServiceResponse('Error requesting device approval', devicePendingApproval, false, 500, 'Error adding device', 'AUTH_SERVICE_ERROR_ADDING_DEVICE_REQUEST', 'Check the logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error requesting device approval', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createUserSession(userId: string, loginData: any) {
    try {
      const createdSession = await this.prisma.session.create({
        data: {
          ...loginData,
          userId,
          isValid: true,
        },
        include: {
          user: true,
          device: true,
        }
      });
      if (createdSession) {
        return new ServiceResponse('User session created successfully', createdSession, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to create User session', createdSession, false, 400, 'Failed to create User session', 'AUTH_SERVICE_ERROR_CREATING_USER_SESSION', 'Check session creation inputs');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating User session', null, false, 500, error.message, error, null);
    }
  }

  async getSessionById(sessionId: string) {
    try {
      const session = await this.prisma.session.findUnique({
        where: {
          sessionId,
        },
      });
      if (session) {
        return new ServiceResponse('Session found', session, true, 200, null, null, null);
      }
      return new ServiceResponse('Session not found', session, false, 404, 'Session not found', 'AUTH_SERVICE_SESSION_NOT_FOUND', 'Confirm the session id and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding session', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserActiveSessions(userId: string) {
    try {
      const sessions = await this.prisma.session.findMany({
        where: {
          userId,
          isValid: true,
        },
      });
      if (sessions) {
        return new ServiceResponse('Sessions found', sessions, true, 200, null, null, null);
      }
      return new ServiceResponse('Sessions not found', sessions, false, 404, 'Sessions not found', 'AUTH_SERVICE_SESSIONS_NOT_FOUND', 'User may be logged out. Confirm userId and login status then try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding sessions', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  static async updateUserSessionsData(redis: RedisConnection, scope: string, sessionIds: string[], userData: any) {
    await redis.client.connect();
    const sessions = await redis.client.hmGet(`${scope}-logged-in`, sessionIds);
    const updatedSessions = sessions.map((session: any) => {
      const parsedSession = JSON.parse(session);
      return {
        ...parsedSession,
        user: {
          ...userData,
        },
      };
    });
    const updatedSessionsData: { [key: string]: any } = {};
    updatedSessions.forEach((session: any) => {
      const { sessionId } = session;
      updatedSessionsData[sessionId] = JSON.stringify(session);
    });
    await redis.client.hSet(`${scope}-logged-in`, [...Object.entries(updatedSessionsData).flat()]);
    await redis.client.disconnect();
  }

  static async cacheUserSession(redis: RedisConnection, scope: string, session: any) {
    await redis.client.connect();
    await redis.client.hSet(`${scope}-logged-in`, session.sessionId, JSON.stringify(session));
    await redis.client.disconnect();
  }

  async invalidateSameDevicePreviousSessions(redis: RedisConnection, scope: string, userId: string, deviceId: string) {
    try {
      const activeSessions = await this.prisma.session.findMany({
        where: {
          isValid: true,
          deviceId,
        }
      });
      if (activeSessions.length > 0) {
        const sessionIds = activeSessions.map((session: any) => session.sessionId);
        const invalidatedSessions = await this.prisma.session.updateMany({
          where: {
            sessionId: {
              in: sessionIds,
            }
          },
          data: {
            isValid: false,
          }
        });
        if (invalidatedSessions) {
          await redis.client.connect();
          await redis.client.hDel(`${scope}-logged-in`, sessionIds);
          await redis.client.disconnect();
          return new ServiceResponse('User sessions invalidated successfully', invalidatedSessions, true, 200, null, null, null);
        }
        return new ServiceResponse('Error invalidating active Sessions', invalidatedSessions, true, 500, 'error invalidating active sessions', 'AUTH_SERVICE_ERROR_INVALIDATING_USER_SESSIONS', 'Check logs and database');
      }
      return new ServiceResponse('No active sessions found', activeSessions, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error invalidating active Sessions', null, true, 500, error.message, error, 'Check logs and database');
    }
  }

  async invalidateUserSession(redis: RedisConnection, scope: string, sessionId: string) {
    try {
      const invalidatedSession = await this.prisma.session.update({
        where: {
          sessionId,
        },
        data: {
          isValid: false,
        }
      });
      if (invalidatedSession) {
        await redis.client.connect();
        await redis.client.hDel(`${scope}-logged-in`, sessionId);
        await redis.client.disconnect();
        return new ServiceResponse('User session invalidated successfully', invalidatedSession, true, 200, null, null, null);
      }
      return new ServiceResponse('Failed to invalidate User session', invalidatedSession, false, 400, 'Failed to invalidate User session', 'AUTH_SERVICE_ERROR_INVALIDATING_USER_SESSION', 'Check the logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error removing User session', null, false, 500, error.message, error, null);
    }
  }

  async invalidateAllActiveUserSessions(redis: RedisConnection, scope: string, userId: string) {
    const { data: sessions } = await this.getUserActiveSessions(userId);
    if (sessions && sessions.length) {
      const sessionIds = sessions.map((session: any) => session.sessionId);
      try {
        const invalidatedSessions = await this.prisma.session.updateMany({
          where: {
            sessionId: {
              in: sessionIds,
            }
          },
          data: {
            isValid: false,
          }
        });
        if (invalidatedSessions) {
          await redis.client.connect();
          await redis.client.hDel(`${scope}-logged-in`, sessionIds);
          await redis.client.disconnect();
          return new ServiceResponse('User sessions invalidated successfully', invalidatedSessions, true, 200, null, null, null);
        }
      } catch (error: any) {
        console.log({ error });
        return new ServiceResponse('Error invalidating active Sessions', null, true, 500, error.message, error, 'Check logs and database');
      }

      return new ServiceResponse('Error invalidating active Sessions', null, true, 500, 'error invalidating active sessions', 'AUTH_SERVICE_ERROR_INVALIDATING_USER_SESSIONS', 'Check logs and database');
    }
    return new ServiceResponse('No active sessions found', sessions, true, 200, null, null, null);
  }

  async softDeleteUserAccount(userId: string) {
    try {
      const deletedUser = await this.prisma.user.findFirst({
        where: {
          userId,
        }
      });
      if (deletedUser) {
        const updateData = desanitizeData(['username'], deletedUser, deletedUser.userId);
        const softDeletedUser = await this.prisma.user.update({
          where: {
            userId,
          },
          data: {
            ...updateData,
            deletedAt: new Date(),
          }
        });
        return new ServiceResponse('User account deleted successfully', { ...deletedUser, deletedAt: softDeletedUser.deletedAt, username: softDeletedUser.username }, true, 200, null, null, null);
      }
      return new ServiceResponse('User account not found', deletedUser, false, 404, 'User account not found', 'AUTH_SERVICE_USER_NOT_FOUND', 'Check the userId and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting User', null, false, 500, error.message, error, null);
    }
  }

  async recoverSoftDeletedAccount(userId: string) {
    try {
      const userToRecover = await this.prisma.user.findFirst({
        where: {
          userId,
          deletedAt: {
            not: null,
          }
        },
      });
      if (userToRecover) {
        const updateData = resanitizeData(userSoftDeleteFields, userToRecover, userToRecover.userId);
        const { success: usernameTaken } = await this.findUserByUsername(updateData.username);
        if (usernameTaken) {
          return new ServiceResponse('Username already taken', null, false, 400, 'Username already taken', 'AUTH_SERVICE_USERNAME_TAKEN', 'Choose a different username');
        }
        const { success: emailTaken } = await this.findUserByEmail(updateData.email);
        if (emailTaken) {
          return new ServiceResponse('Email already taken', null, false, 400, 'Email already taken', 'AUTH_SERVICE_EMAIL_TAKEN', 'Choose a different email');
        }
        const recoveredUser = await this.prisma.user.update({
          where: {
            userId,
          },
          data: {
            ...updateData,
            deletedAt: null,
          }
        });
        console.log({ recoveredUser });
        return new ServiceResponse('User account recovered successfully', recoveredUser, true, 200, null, null, null);
      }
      return new ServiceResponse('User account not found', userToRecover, false, 404, 'User account not found', 'AUTH_SERVICE_USER_NOT_FOUND', 'Check the userId and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error recovering User', null, false, 500, error.message, error, null);
    }
  }

  async purgeUserAccount(userId: string) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: {
          userId,
        }
      });
      if (deletedUser) {
        return new ServiceResponse('User account deleted successfully', deletedUser, true, 200, null, null, null);
      }
      return new ServiceResponse('User account not found', deletedUser, false, 404, 'User account not found', 'AUTH_SERVICE_USER_NOT_FOUND', 'Check the userId and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting User', null, false, 500, error.message, error, null);
    }
  }

  async purgeUserSessions(redis: RedisConnection, scope: string, userId: string) {
    try {
      const allUserSessions = await this.prisma.session.findMany({
        where: {
          userId,
        }
      });
      if (allUserSessions.length) {
        const sessionIds = allUserSessions.map((session: any) => session.sessionId);
        const deletedSessions = await this.prisma.session.deleteMany({
          where: {
            sessionId: {
              in: sessionIds,
            }
          }
        });
        await redis.client.connect();
        await redis.client.hDel(`${scope}-logged-in`, sessionIds);
        await redis.client.disconnect();
        return new ServiceResponse('User sessions purged successfully', deletedSessions, true, 200, null, null, null);
      }
      return new ServiceResponse('User sessions not found', allUserSessions, false, 404, 'User sessions not found', 'AUTH_SERVICE_NO_USER_SESSIONS_FOUND', 'Check the userId and try again');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error purging User sessions', null, false, 500, error.message, error, null);
    }
  }
}
