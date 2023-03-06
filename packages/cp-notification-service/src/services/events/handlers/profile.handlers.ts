import { ServiceEvent, ServiceResponse } from '@cribplug/common';
import NotificationDBService from '../../notification.service';
import { addToFollowerNotificationQueue } from '../../queue/notificationQueue';
import UserDBService from '../../user.service';

const ns = new NotificationDBService();
const us = new UserDBService();

export const profileDefaultJobHandler = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const profileDefaultExchangeHandler = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const USER_FOLLOWED_USER = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const { data } = message;
  const ffnExists = await us.findUserById(data.followingId);
  const ffrExists = await us.findUserById(data.followerId);
  if (!ffnExists.success) return ffnExists;
  if (!ffrExists.success) return ffrExists;
  ffnExists.data.followers.push(data.followerId);
  ffrExists.data.following.push(data.followingId);
  const ffrs = await ns.setFollowers(
    data.followingId,
    Array.from(new Set(ffnExists.data.followers))
  );
  if (!ffrs.success) return ffrs;
  const ffns = await ns.setFollowing(
    data.followerId,
    Array.from(new Set(ffrExists.data.following))
  );
  if (!ffns.success) return ffns;
  await addToFollowerNotificationQueue(data);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const USER_SENT_FOLLOW_REQUEST = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const USER_UNFOLLOWED_USER = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const { data } = message;
  const ffnExists = await us.findUserById(data.followingId);
  const ffrExists = await us.findUserById(data.followerId);
  if (!ffnExists.success) return ffnExists;
  if (!ffrExists.success) return ffrExists;
  const ffrs = await ns.setFollowers(
    data.followingId,
    Array.from(new Set(ffnExists.data.followers.filter((x: string) => x !== data.followerId)))
  );
  if (!ffrs.success) return ffrs;
  const ffns = await ns.setFollowing(
    data.followerId,
    Array.from(new Set(ffrExists.data.following.filter((x: string) => x !== data.followingId)))
  );
  if (!ffns.success) return ffns;
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const USER_BLOCKED_USER = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};

export const USER_UNBLOCKED_USER = async (message: ServiceEvent) => {
  console.log('Handling Event: ', message.type);
  const sr = new ServiceResponse('Message handled', message.type, true, 200, null, null, null, null);
  return sr;
};
