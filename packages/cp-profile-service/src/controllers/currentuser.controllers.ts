import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import ProfileDBService from '../services/profile.service';
import { addToFollowQueue, addToFollowRequestQueue, addToUnFollowQueue } from '../services/queue/followQueue';
import UserDBService from '../services/user.service';

const ps = new ProfileDBService();
const us = new UserDBService();

export const getUserFollowersHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps.getUserFollowers(req.user.userId, page, limit, req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const searchUserFollowersHandler = async (req: Request, res: Response) => {
  const { q: searchTerm } = req.query;
  if (!searchTerm) {
    const serviceResponse = new ServiceResponse(
      'Search term is required',
      null,
      false,
      400,
      'Search term is required',
      'Search term is required',
      'Add search term to request query params'
    );
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  }
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps.searchUserFollowers(req.user.userId, searchTerm as string, page, limit, req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const followUserHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: toFollow } = await us.findUserByUsername(username);
  const { userId: followingId, profileSettings } = toFollow;
  // Check if already following
  const following = await ps.checkUserFollowing(req.user.userId, followingId);
  if (following.success) {
    following.message = `You are already following @${username}`;
    return res.status(following.statusCode).send(following);
  }
  const pendingfollowRequest = await ps.checkPendingFollowRequest(req.user.userId, followingId);
  if (pendingfollowRequest.success) {
    pendingfollowRequest.message = `Your request to follow @${username} is still pending`;
    return res.status(pendingfollowRequest.statusCode).send(pendingfollowRequest);
  }
  if (!profileSettings) {
    const newFollowing = await ps.createNewFollowing(req.user.userId, followingId);
    await addToFollowQueue(newFollowing.data);
    newFollowing.message = `You are now following @${username}`;
    return res.status(newFollowing.statusCode).send(newFollowing);
  }
  if (profileSettings && !profileSettings.allowFollow) {
    const followRequest = await ps.createFollowRequest(req.user.userId, followingId);
    followRequest.message = `A follow request has been sent to @${username}`;
    await addToFollowRequestQueue(followRequest.data);
    return res.status(followRequest.statusCode).send(followRequest);
  }
  const sr = await ps.createNewFollowing(req.user.userId, followingId);
  sr.message = `You are now following @${username}`;
  await addToFollowQueue(sr.data);
  return res.status(sr.statusCode).send(sr);
};

export const getUserFollowingHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps.getUserFollowing(req.user.userId, page, limit, req.user.userId);
  return res.status(sr.statusCode).send(sr);
};

export const searchUserFollowingHandler = async (req: Request, res: Response) => {
  const { q: searchTerm } = req.query;
  if (!searchTerm) {
    const serviceResponse = new ServiceResponse(
      'Search term is required',
      null,
      false,
      400,
      'Search term is required',
      'Search term is required',
      'Add search term to request query params'
    );
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  }
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps.searchUserFollowing(req.user.userId, searchTerm as string, page, limit);
  return res.status(sr.statusCode).send(sr);
};

export const getUserSentFollowRequestsHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps.getUserSentFollowRequests(req.user.userId, page, limit);
  return res.status(sr.statusCode).send(sr);
};

export const searchUserSentFollowRequestsHandler = async (req: Request, res: Response) => {
  const { q: searchTerm } = req.query;
  if (!searchTerm) {
    const serviceResponse = new ServiceResponse(
      'Search term is required',
      null,
      false,
      400,
      'Search term is required',
      'Search term is required',
      'Add search term to request query params'
    );
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  }
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps
    .searchUserSentFollowRequests(
      req.user.userId,
      searchTerm as string,
      page,
      limit,
      req.user.userId
    );
  return res.status(sr.statusCode).send(sr);
};

export const getUserReceivedFollowRequestsHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps.getUserSentFollowRequests(req.user.userId, page, limit);
  return res.status(sr.statusCode).send(sr);
};

export const searchUserReceivedFollowRequestsHandler = async (req: Request, res: Response) => {
  const { q: searchTerm } = req.query;
  if (!searchTerm) {
    const serviceResponse = new ServiceResponse(
      'Search term is required',
      null,
      false,
      400,
      'Search term is required',
      'Search term is required',
      'Add search term to request query params'
    );
    return res.status(serviceResponse.statusCode).send(serviceResponse);
  }
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps
    .searchUserReceivedFollowRequests(
      req.user.userId,
      searchTerm as string,
      page,
      limit,
      req.user.userId
    );
  return res.status(sr.statusCode).send(sr);
};

export const getUserFollowRequestsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const bulkAcceptFollowRequestsHandler = async (req: Request, res: Response) => {
  const sr = await ps.bulkAcceptFollowRequests(req.user.userId);
  // TODO: publish new Following event
  return res.status(sr.statusCode).send(sr);
};

export const bulkCancelFollowRequestsHandler = async (req: Request, res: Response) => {
  const sr = await ps.bulkCancelFollowRequests(req.user.userId);
  // TODO: publish follow requests cancelled event
  return res.status(sr.statusCode).send(sr);
};

export const getUserFollowingUserStatusHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const acceptFollowRequestHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: { userId } } = await us.findUserByUsername(username);
  const sr = await ps.acceptFollowRequest(req.user.userId, userId);
  // TODO: publish accepted follow request event
  return res.status(sr.statusCode).send(sr);
};

export const declineFollowRequestHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: { userId } } = await us.findUserByUsername(username);
  const sr = await ps.deleteFollowRequest(userId, req.user.userId);
  // TODO: publish declined follow request event
  return res.status(sr.statusCode).send(sr);
};

export const cancelSentFollowRequestHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: { userId } } = await us.findUserByUsername(username);
  const sr = await ps.deleteFollowRequest(req.user.userId, userId);
  // TODO: publish user deleted follow request
  return res.status(sr.statusCode).send(sr);
};

export const getUserBlockedUsersHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await ps.getBlockedUsers(req.user.userId, page, limit);
  return res.status(sr.statusCode).send(sr);
};

export const blockUserHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: { userId } } = await us.findUserByUsername(username);
  const sr = await ps.blockUser(req.user.userId, userId);
  // TODO: publish user blocked user event
  return res.status(sr.statusCode).send(sr);
};

export const unblockUserHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: { userId } } = await us.findUserByUsername(username);
  const sr = await ps.removeBlock(req.user.userId, userId);
  // TODO: publish user removed block event
  return res.status(sr.statusCode).send(sr);
};

export const removeUserFollowingUserHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: { userId } } = await us.findUserByUsername(username);
  const sr = await ps.deleteFollowing(userId, req.user.userId);
  // TODO: publish user removed follower event
  return res.status(sr.statusCode).send(sr);
};

export const unfollowUserHandler = async (req: Request, res: Response) => {
  const { username } = req.params;
  const { data: { userId } } = await us.findUserByUsername(username);
  const isFollowing = await ps.checkUserFollowing(req.user.userId, userId);
  if (!isFollowing.success) {
    isFollowing.message = `You are not following @${username}`;
    return res.status(isFollowing.statusCode).send(isFollowing);
  }
  const sr = await ps.deleteFollowing(req.user.userId, userId);
  if (sr.success) {
    sr.message = `You are no longer following @${username}`;
    await addToUnFollowQueue(sr.data);
  }
  return res.status(sr.statusCode).send(sr);
};

export const getTaggableProfilesHandler = async (req: Request, res: Response) => {
  const { q: searchTerm } = req.query;
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  let sr: ServiceResponse;
  if (searchTerm) {
    sr = await ps.searchAllProfiles(searchTerm as string, page, limit, req.user.userId);
  } else {
    sr = await ps.getTaggableProfiles(req.user.userId, limit);
  }
  return res.status(sr.statusCode).send(sr);
};
