import { Prisma, PrismaClient, Profile } from '@prisma/client';
import {
  getDriver, Driver, ServiceResponse
} from '@cribplug/common';
import prisma from '../lib/prisma';

export default class ProfileDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }

  async getFollowingIds(userId: string) {
    const followingUser = await this.prisma.follows.findMany({
      where: {
        followingId: userId,
      }
    });
    const followedByUser = await this.prisma.follows.findMany({
      where: {
        followerId: userId,
      }
    });
    const sentFollowRequests = await this.prisma.followRequest.findMany({
      where: {
        requestedById: userId,
      }
    });
    const receivedFollowRequests = await this.prisma.followRequest.findMany({
      where: {
        receiverId: userId,
      }
    });
    const blockedYou = await this.prisma.blocked.findMany({
      where: {
        blockedId: userId,
      }
    });
    const blockedByYou = await this.prisma.blocked.findMany({
      where: {
        blockedById: userId,
      }
    });
    const followingIds = followingUser.length ? followingUser.map((f) => f.followerId) : [];
    const followerIds = followedByUser.length ? followedByUser.map((f) => f.followingId) : [];
    const sentRequestIds = sentFollowRequests.length
      ? sentFollowRequests.map((f) => f.receiverId) : [];
    const receivedRequestIds = receivedFollowRequests.length
      ? receivedFollowRequests.map((f) => f.requestedById) : [];
    const blockedYouIds = blockedYou.length ? blockedYou.map((b) => b.blockedById) : [];
    const blockedByYouIds = blockedByYou.length ? blockedByYou.map((b) => b.blockedId) : [];
    return {
      followingIds, followerIds, sentRequestIds, receivedRequestIds, blockedByYouIds, blockedYouIds
    };
  }

  async getFollowingStatus(userId: string, perspectiveId: string) {
    try {
      const {
        followingIds,
        followerIds,
        sentRequestIds,
        receivedRequestIds,
        blockedYouIds,
        blockedByYouIds
      } = await this.getFollowingIds(perspectiveId);
      const followsYou = followingIds.length ? followingIds.includes(userId) : false;
      const followedByYou = followerIds.length ? followerIds.includes(userId) : false;
      const sentRequest = sentRequestIds.length ? sentRequestIds.includes(userId) : false;
      const recievedRequest = receivedRequestIds.length
        ? receivedRequestIds.includes(userId) : false;
      const blockedYou = blockedYouIds.length ? blockedYouIds.includes(userId) : false;
      const blockedByYou = blockedByYouIds.length
        ? blockedByYouIds.includes(userId) : false;
      return new ServiceResponse('User profile', {
        followsYou,
        followedByYou,
        sentRequest,
        recievedRequest,
        blockedYou,
        blockedByYou
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting following Status', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getProfileByUserId(userId: string, loggedInUserId: string | null = null) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: {
          userId,
        },
        include: {
          profileSettings: true,
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      });
      if (!profile) {
        return new ServiceResponse('User profile not found', profile, false, 404, 'User profile not found', 'PROFILE_SERVICE_PROFILE_NOT_FOUND', 'Check logs and database');
      }
      let data;
      if (loggedInUserId) {
        const {
          followingIds,
          followerIds,
          sentRequestIds,
          receivedRequestIds,
          blockedYouIds,
          blockedByYouIds
        } = await this.getFollowingIds(loggedInUserId);
        const followsYou = followingIds.length ? followingIds.includes(profile.userId) : false;
        const followedByYou = followerIds.length ? followerIds.includes(profile.userId) : false;
        const sentRequest = sentRequestIds.length ? sentRequestIds.includes(profile.userId) : false;
        const recievedRequest = receivedRequestIds.length
          ? receivedRequestIds.includes(profile.userId) : false;
        const blockedYou = blockedYouIds.length ? blockedYouIds.includes(profile.userId) : false;
        const blockedByYou = blockedByYouIds.length
          ? blockedByYouIds.includes(profile.userId) : false;
        data = {
          ...profile,
          followsYou,
          followedByYou,
          sentRequest,
          recievedRequest,
          blockedYou,
          blockedByYou,
        };
      } else {
        data = profile;
      }
      return new ServiceResponse('User profile', data, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user profile', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserFollowers(
    userId: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const followers = await this.prisma.follows.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          followingId: userId
        },
        include: {
          follower: true,
        }
      });
      const total = await this.prisma.follows.count({
        where: {
          followingId: userId,
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (followers.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = followers.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.followerId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.followerId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.followerId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.followerId) : false,
        }));
      } else {
        data = followers;
      }
      return new ServiceResponse('User followers', {
        total,
        data,
        page,
        pages,
        limit,
        prev,
        next
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user fllowers', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchUserFollowers(
    userId: string,
    searchTerm: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const followers = await this.prisma.follows.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              followingId: userId
            },
            {
              follower: {
                OR: [
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                  }
                ]
              }
            }
          ]
        },
        include: {
          follower: true,
        }
      });
      const total = await this.prisma.follows.count({
        where: {
          AND: [
            {
              followingId: userId
            },
            {
              follower: {
                OR: [
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                  }
                ]
              }
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (followers.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = followers.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.followerId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.followerId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.followerId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.followerId) : false,
        }));
      } else {
        data = followers;
      }
      return new ServiceResponse(
        'Search user followers',
        {
          total, data, page, pages, limit, prev, next, searchTerm,
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error searching user followers', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserFollowing(
    userId: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const following = await this.prisma.follows.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          followerId: userId
        },
        include: {
          following: true,
        }
      });
      const total = await this.prisma.follows.count({
        where: {
          followerId: userId
        },
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      console.log({ length: following.length, loggedInUserId });
      if (following.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = following.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.followingId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.followingId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.followingId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.followingId) : false,
        }));
      } else {
        data = following;
      }
      return new ServiceResponse(
        'User following',
        {
          total, data, page, pages, limit, prev, next
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user following', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchUserFollowing(
    userId: string,
    searchTerm: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const following = await this.prisma.follows.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              followerId: userId
            },
            {
              following: {
                OR: [
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                  }
                ]
              }
            }
          ]
        },
        include: {
          following: true,
        }
      });
      const total = await this.prisma.follows.count({
        where: {
          AND: [
            {
              followerId: userId
            },
            {
              following: {
                OR: [
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive'
                    },
                  }
                ]
              }
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      console.log({ length: following.length, loggedInUserId });
      if (following.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = following.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.followingId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.followingId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.followingId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.followingId) : false,
        }));
      } else {
        data = following;
      }
      return new ServiceResponse(
        'Search user following',
        {
          total, data, page, pages, limit, prev, next, searchTerm
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error searching user followers', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserSentFollowRequests(
    userId: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const sentFollowRequests = await this.prisma.followRequest.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          requestedById: userId,
        },
        include: {
          receiver: true,
        }
      });
      const total = await this.prisma.followRequest.count({
        where: {
          requestedById: userId,
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      console.log({ length: sentFollowRequests.length, loggedInUserId });
      if (sentFollowRequests.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = sentFollowRequests.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.receiverId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.receiverId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.receiverId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.receiverId) : false,
        }));
      } else {
        data = sentFollowRequests;
      }
      return new ServiceResponse(
        'Sent follow requests',
        {
          total, pages, page, prev, next, data, limit
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting sent follow requests', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchUserSentFollowRequests(
    userId: string,
    searchTerm: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const sentFollowRequests = await this.prisma.followRequest.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              requestedById: userId,
            },
            {
              receiver: {
                OR: [
                  {
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    bio: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  }
                ]
              }
            }
          ]
        },
        include: {
          receiver: true,
        }
      });
      const total = await this.prisma.followRequest.count({
        where: {
          AND: [
            {
              requestedById: userId,
            },
            {
              receiver: {
                OR: [
                  {
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    bio: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  }
                ]
              }
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      if (sentFollowRequests.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = sentFollowRequests.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.receiverId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.receiverId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.receiverId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.receiverId) : false,
        }));
      } else {
        data = sentFollowRequests;
      }
      return new ServiceResponse(
        'Sent follow requests',
        {
          total, pages, page, prev, next, data, limit
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting user sent follow requests', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchUserReceivedFollowRequests(
    userId: string,
    searchTerm: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const receivedFollowRequests = await this.prisma.followRequest.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              receiverId: userId,
            },
            {
              requestedBy: {
                OR: [
                  {
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    bio: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  }
                ]
              }
            }
          ]
        },
        include: {
          requestedBy: true
        }
      });
      const total = await this.prisma.followRequest.count({
        where: {
          AND: [
            {
              receiverId: userId,
            },
            {
              requestedBy: {
                OR: [
                  {
                    displayname: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    username: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  },
                  {
                    bio: {
                      contains: searchTerm,
                      mode: 'insensitive',
                    }
                  }
                ]
              }
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      console.log({ length: receivedFollowRequests.length, loggedInUserId });
      if (receivedFollowRequests.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = receivedFollowRequests.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.requestedById) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.requestedById) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.requestedById) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.requestedById) : false,
        }));
      } else {
        data = receivedFollowRequests;
      }
      return new ServiceResponse(
        'Sent follow requests',
        {
          total, pages, page, prev, next, data, limit
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting recieved follow requests', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkPendingFollowRequest(requestedById: string, receiverId: string) {
    try {
      const followRequest = await this.prisma.followRequest.findUnique({
        where: {
          requestedById_receiverId: {
            receiverId,
            requestedById,
          }
        }
      });
      if (followRequest) {
        return new ServiceResponse('Pending follow request exists', followRequest, true, 200, null, null, null);
      }
      return new ServiceResponse('No pending follow request', followRequest, false, 404, 'Follow request found', 'PROFILE_SERVICE_ERROR_FOLLOW_REQUEST_NOT_FOUND', 'Check userIds, and that follow request exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting pending follow request', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getUserReceivedFollowRequests(
    userId: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const receivedFollowRequests = await this.prisma.followRequest.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          receiverId: userId,
        },
        include: {
          requestedBy: true
        }
      });
      const total = await this.prisma.followRequest.count({
        where: {
          receiverId: userId,
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      console.log({ length: receivedFollowRequests.length, loggedInUserId });
      if (receivedFollowRequests.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = receivedFollowRequests.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.requestedById) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.requestedById) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.requestedById) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.requestedById) : false,
        }));
      } else {
        data = receivedFollowRequests;
      }
      return new ServiceResponse(
        'Sent follow requests',
        {
          total, pages, page, prev, next, data, limit
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting sent follow requests', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async bulkAcceptFollowRequests(userId: string) {
    try {
      const followRequests = await this.prisma.followRequest.findMany({
        where: {
          receiverId: userId
        },
        include: {
          requestedBy: true,
          receiver: true,
        }
      });
      if (!followRequests.length) {
        return new ServiceResponse('No pending follow requests', followRequests, false, 404, 'No pending Follow requests to accept', 'PROFILE_SERVICE_ERROR_PENDING_FOLLOW_REQUESTS_NOT_FOUND', 'Check that follow requests exist');
      }
      const ids = followRequests.map((fr) => ({
        followerId: fr.requestedById,
        followingId: fr.receiverId
      }));
      const newFollows = await this.prisma.follows.createMany({
        data: [...ids],
        skipDuplicates: true
      });
      const deletedRequests = await this.prisma.followRequest.deleteMany({
        where: {
          receiverId: userId,
        }
      });
      console.log({ newFollows, deletedRequests });
      return new ServiceResponse('All Follow Request Accepted', followRequests, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error accepting follow requests', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async bulkCancelFollowRequests(userId: string) {
    try {
      const followRequests = await this.prisma.followRequest.findMany({
        where: {
          receiverId: userId
        },
        include: {
          requestedBy: true,
          receiver: true,
        }
      });
      if (!followRequests.length) {
        return new ServiceResponse('No pending follow requests', followRequests, true, 200, null, null, null);
      }
      const deletedRequests = await this.prisma.followRequest.deleteMany({
        where: {
          receiverId: userId,
        }
      });
      console.log({ deletedRequests });
      return new ServiceResponse('Follow requests declined', followRequests, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error cancelling Follow Requests', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async acceptFollowRequest(receiverId: string, requestedById: string) {
    try {
      const followRequest = await this.prisma.followRequest.findUnique({
        where: {
          requestedById_receiverId: {
            receiverId,
            requestedById,
          }
        }
      });
      if (!followRequest) {
        return new ServiceResponse('Follow Request not found', followRequest, false, 404, 'Follow request not found', 'PROFILE_SERVICE_ERROR_FOLLOW_REQUEST_NOT_FOUND', 'Check that follow request exists');
      }
      const newFollowing = await this.prisma.follows.create({
        data: {
          followerId: requestedById,
          followingId: receiverId,
        },
        include: {
          follower: true,
          following: true,
        }
      });
      const deletedFollowRequest = await this.prisma.followRequest.delete({
        where: {
          requestedById_receiverId: {
            receiverId,
            requestedById,
          }
        }
      });
      console.log({ deletedFollowRequest });
      return new ServiceResponse('Follow Request accepted', newFollowing, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error accepting follow request', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getBlockedUsers(userId: string, page = 1, limit = 12) {
    try {
      const blocked = await this.prisma.blocked.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          blockedById: userId,
        },
        include: {
          blocked: true,
        }
      });
      const total = await this.prisma.blocked.count({
        where: {
          blockedById: userId
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      return new ServiceResponse('Your blocked users', {
        total, pages, limit, prev, next, blocked
      }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting blocked users', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async blockUser(blockerId: string, blockedId: string) {
    try {
      const block = await this.prisma.blocked.create({
        data: {
          blockedById: blockerId,
          blockedId,
        },
        include: {
          blocked: true,
          blockedBy: true,
        }
      });
      if (block) {
        return new ServiceResponse('User blocked user', block, true, 200, null, null, null);
      }
      return new ServiceResponse('Error blocking user', block, false, 400, 'Error blocking user', 'PROFILE_SERVICE_ERROR_BLOCKING_USER', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error blocking user', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async removeBlock(blockerId: string, blockedId: string) {
    try {
      const removedBlock = await this.prisma.blocked.delete({
        where: {
          blockedById_blockedId: {
            blockedById: blockerId,
            blockedId,
          }
        }
      });
      if (removedBlock) {
        return new ServiceResponse('Block removed', removedBlock, true, 200, null, null, null);
      }
      return new ServiceResponse('Error removing block', removedBlock, false, 400, 'Error removing block', 'POST_SERVICE_ERROR_REMOVING_BLOCK', 'Check user Ids, and confirm that block exists');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error removing block', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async checkUserFollowing(followerId: string, followingId: string) {
    try {
      const following = await this.prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          }
        },
        include: {
          follower: true,
          following: true,
        }
      });
      if (following) {
        return new ServiceResponse('User follows user', following, true, 200, null, null, null);
      }
      return new ServiceResponse('User following not found', following, false, 404, 'Following not found', 'PROFILE_SERVICE_ERROR_FOLLOWING_NOT_FOUND', 'Check following exists and was recorded properly');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding following', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createNewFollowing(followerId: string, followingId: string) {
    try {
      const following = await this.prisma.follows.create({
        data: {
          followerId,
          followingId,
        },
        include: {
          follower: true,
          following: true,
        }
      });
      if (following) {
        return new ServiceResponse('User follows user', following, true, 200, null, null, null);
      }
      return new ServiceResponse('User following not found', following, false, 404, 'Following not found', 'PROFILE_SERVICE_ERROR_FOLLOWING_NOT_FOUND', 'Check following exists and was recorded properly');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error finding following', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async createFollowRequest(followerId: string, followingId: string) {
    try {
      const followRequest = await this.prisma.followRequest.create({
        data: {
          requestedById: followerId,
          receiverId: followingId,
        }
      });
      if (followRequest) {
        return new ServiceResponse('Follow Request sent', followRequest, true, 200, null, null, null);
      }
      return new ServiceResponse('Error creating follow request', followRequest, false, 400, 'Error creating follow request', 'PROFILE_SERVICE_ERROR_CREATING_FOLLOW_REQUEST', 'Check userIds, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating follow request', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async deleteFollowing(followerId: string, followingId: string) {
    try {
      const deletedFollowing = await this.prisma.follows.delete({
        where: {
          followerId_followingId: {
            followerId,
            followingId,
          }
        },
        include: {
          follower: true,
          following: true,
        }
      });
      if (deletedFollowing) {
        return new ServiceResponse('Following deleted', deletedFollowing, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting following', deletedFollowing, false, 400, 'Error deleting following', 'PROFILE_SERVICE_ERROR_DELETING_FOLLOWING', 'Check userIds, logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting following', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async deleteFollowRequest(requestedById: string, receiverId: string) {
    try {
      const deletedFollowRequest = await this.prisma.followRequest.delete({
        where: {
          requestedById_receiverId: {
            receiverId,
            requestedById,
          }
        }
      });
      if (deletedFollowRequest) {
        return new ServiceResponse('Follow request', deletedFollowRequest, true, 200, null, null, null);
      }
      return new ServiceResponse('Error deleting follow request', deletedFollowRequest, false, 400, 'Error deleting follow request', 'PROFILE_SERVICE_ERROR_DELETING_FOLLOW_REQUEST', 'Check logs and database');
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error deleting follow request', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getRandomProfiles(limit = 12, userId: string | null = null, suggestedIds: string[] = []) {
    const query = suggestedIds.map((x) => `"${x}"`);
    console.log({
      suggestedIds, query, reformed: query.join(','), userId
    });
    try {
      let profiles: Profile[];
      if (suggestedIds.length) {
        profiles = userId
          ? await this.prisma.$queryRaw(Prisma.sql`SELECT * FROM "Profile" WHERE "userId"<>${userId} AND "userId" NOT IN (SELECT "userId" FROM "Profile" where "userId" IN (${Prisma.join(suggestedIds)})) ORDER BY RANDOM() LIMIT ${limit}`)
          : await this.prisma.$queryRaw(Prisma.sql`SELECT * FROM "Profile" WHERE "userId" NOT IN (${Prisma.join(suggestedIds)}) ORDER BY RANDOM() LIMIT ${limit}`);
      } else {
        profiles = userId
          ? await this.prisma.$queryRaw(Prisma.sql`SELECT * FROM "Profile" WHERE "userId"<>${userId} ORDER BY RANDOM() LIMIT ${limit}`)
          : await this.prisma.$queryRaw(Prisma.sql`SELECT * FROM "Profile" ORDER BY RANDOM() LIMIT ${limit}`);
      }
      let data;
      if (profiles.length && userId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(userId);
        data = profiles.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.userId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.userId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.userId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.userId) : false,
        }));
      } else {
        data = profiles;
      }
      return new ServiceResponse('Profiles', data, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting random profiles', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchAllProfiles(
    searchTerm: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const profiles = await this.prisma.profile.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          OR: [
            {
              username: {
                startsWith: searchTerm,
                mode: 'insensitive'
              },
            },
            {
              displayname: {
                startsWith: searchTerm,
                mode: 'insensitive'
              },
            }
          ]
        },
        include: {
          profileSettings: true,
        }
      });
      const total = await this.prisma.profile.count({
        where: {
          OR: [
            {
              username: {
                startsWith: searchTerm,
                mode: 'insensitive'
              },
            },
            {
              displayname: {
                startsWith: searchTerm,
                mode: 'insensitive'
              },
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      console.log({ length: profiles.length, searchTerm, loggedInUserId });
      if (profiles.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = profiles.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.userId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.userId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.userId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.userId) : false,
          isYou: ffer.userId === loggedInUserId
        }));
      } else {
        data = profiles;
      }
      return new ServiceResponse(
        'Search user following',
        {
          total, data, page, pages, limit, prev, next, searchTerm
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error fetching user profiles', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchProfiles(
    searchTerm: string,
    page = 1,
    limit = 12,
    loggedInUserId: string | null = null
  ) {
    try {
      const exceptions = loggedInUserId ? [loggedInUserId] : [];
      const profiles = await this.prisma.profile.findMany({
        skip: (page - 1) * limit,
        take: limit,
        where: {
          AND: [
            {
              userId: {
                notIn: exceptions,
              }
            },
            {
              OR: [
                {
                  username: {
                    startsWith: searchTerm,
                    mode: 'insensitive'
                  }
                },
                {
                  displayname: {
                    startsWith: searchTerm,
                    mode: 'insensitive'
                  },
                }
              ]
            }
          ]
        },
        include: {
          profileSettings: true,
        }
      });
      const total = await this.prisma.profile.count({
        where: {
          AND: [
            {
              userId: {
                not: loggedInUserId || '',
              }
            },
            {
              OR: [
                {
                  username: {
                    contains: searchTerm,
                    mode: 'insensitive'
                  },
                },
                {
                  displayname: {
                    contains: searchTerm,
                    mode: 'insensitive'
                  },
                }
              ]
            }
          ]
        }
      });
      const pages = Math.ceil(total / limit) || 1;
      const prev = pages > 1 && page <= pages && page > 0 ? page - 1 : null;
      const next = pages > 1 && page < pages && page > 0 ? page + 1 : null;
      let data;
      console.log({ length: profiles.length, loggedInUserId });
      if (profiles.length && loggedInUserId) {
        const {
          followingIds, followerIds, sentRequestIds, receivedRequestIds
        } = await this.getFollowingIds(loggedInUserId);
        data = profiles.map((ffer) => ({
          ...ffer,
          followsYou: followingIds.length ? followingIds.includes(ffer.userId) : false,
          followedByYou: followerIds.length ? followerIds.includes(ffer.userId) : false,
          sentRequest: sentRequestIds.length ? sentRequestIds.includes(ffer.userId) : false,
          recievedRequest: receivedRequestIds.length
            ? receivedRequestIds.includes(ffer.userId) : false,
          isYou: ffer.userId === loggedInUserId
        }));
      } else {
        data = profiles;
      }
      return new ServiceResponse(
        'Search user following',
        {
          total, data, page, pages, limit, prev, next, searchTerm
        },
        true,
        200,
        null,
        null,
        null
      );
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error fetching user profiles', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getTaggableProfiles(userId: string, limit = 6) {
    try {
      const {
        followerIds,
        followingIds,
        sentRequestIds,
        receivedRequestIds
      } = await this.getFollowingIds(userId);
      const allIds = Array
        .from(new Set(
          [...followerIds, ...followingIds, ...sentRequestIds, ...receivedRequestIds, userId]
        ));
      const profiles = await this.prisma.profile.findMany({
        take: limit,
        where: {
          AND: [
            {
              userId: {
                in: allIds
              }
            },
            {
              blocked: {
                none: {
                  blockedById: userId
                }
              }
            }
          ]
        },
        include: {
          profileSettings: true,
        }
      });
      const data = profiles.map((p) => ({
        ...p,
        followsYou: followingIds.length ? followingIds.includes(p.userId) : false,
        followedByYou: followerIds.length ? followerIds.includes(p.userId) : false,
        sentRequest: sentRequestIds.length ? sentRequestIds.includes(p.userId) : false,
        recievedRequest: receivedRequestIds.length
          ? receivedRequestIds.includes(p.userId) : false,
        isYou: p.userId === userId
      }));
      return new ServiceResponse('Taggable profiles', { data }, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting taggable profiles', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async searchTaggableProfiles(
    userId: string,
    searchTerm: string,
    limit = 6,
  ) {
    try {
      const {
        followerIds,
        followingIds,
        sentRequestIds,
        receivedRequestIds
      } = await this.getFollowingIds(userId);
      const allIds = Array
        .from(new Set(
          [...followerIds, ...followingIds, ...sentRequestIds, ...receivedRequestIds, userId]
        ));
      const profiles = await this.prisma.profile.findMany({
        take: limit,
        where: {
          AND: [
            {
              userId: {
                in: allIds
              }
            },
            {
              blocked: {
                none: {
                  blockedById: userId
                }
              }
            },
            {
              OR: [
                {
                  username: {
                    startsWith: searchTerm,
                    mode: 'insensitive'
                  }
                },
                {
                  displayname: {
                    startsWith: searchTerm,
                    mode: 'insensitive'
                  }
                }
              ]
            }
          ]
        },
        include: {
          profileSettings: true,
        }
      });
      const data = profiles.map((p) => ({
        ...p,
        followsYou: followingIds.length ? followingIds.includes(p.userId) : false,
        followedByYou: followerIds.length ? followerIds.includes(p.userId) : false,
        sentRequest: sentRequestIds.length ? sentRequestIds.includes(p.userId) : false,
        recievedRequest: receivedRequestIds.length
          ? receivedRequestIds.includes(p.userId) : false,
      }));
      return new ServiceResponse('Taggable profiles', data, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting taggable profiles', null, false, 500, error.message, error, 'Check logs and database');
    }
  }

  async getProfileByUsername(username: string, loggedInUserId: string | null = null) {
    try {
      const profile = await this.prisma.profile.findUnique({
        where: {
          username
        },
        include: {
          profileSettings: true,
          _count: {
            select: {
              followers: true,
              following: true,
            }
          }
        }
      });
      let data;
      if (!profile) {
        return new ServiceResponse('User profile not found', profile, false, 404, 'User profile not found', 'PROFILE_SERVICE_PROFILE_NOT_FOUND', 'Check logs and database');
      }
      if (loggedInUserId) {
        const {
          followingIds,
          followerIds,
          sentRequestIds,
          receivedRequestIds,
          blockedYouIds,
          blockedByYouIds
        } = await this.getFollowingIds(loggedInUserId);
        const followsYou = followingIds.length ? followingIds.includes(profile.userId) : false;
        const followedByYou = followerIds.length ? followerIds.includes(profile.userId) : false;
        const sentRequest = sentRequestIds.length ? sentRequestIds.includes(profile.userId) : false;
        const recievedRequest = receivedRequestIds.length
          ? receivedRequestIds.includes(profile.userId) : false;
        const blockedYou = blockedYouIds.length ? blockedYouIds.includes(profile.userId) : false;
        const blockedByYou = blockedByYouIds.length
          ? blockedByYouIds.includes(profile.userId) : false;
        const isYou = profile.userId === loggedInUserId;
        data = {
          ...profile,
          followsYou,
          followedByYou,
          sentRequest,
          recievedRequest,
          blockedYou,
          blockedByYou,
          isYou
        };
      } else {
        data = profile;
      }
      return new ServiceResponse('User profile', data, true, 200, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error getting profile', null, false, 500, error.message, error, 'Check logs and database');
    }
  }
}
