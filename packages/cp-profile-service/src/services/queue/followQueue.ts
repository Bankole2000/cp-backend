import { getIO, ServiceEvent, contentModerationRoles } from '@cribplug/common';
import BullQueue, { Job, JobOptions } from 'bull';
import { config } from '../../utils/config';
import { getServiceQueues, sendToServiceQueues } from '../events.service';
import { getChannel, getRedis } from '../../utils/common';
import { socketEventTypes } from '../../schema/socket.schema';

const { redisConfig: { scope, url: redisUrl }, self: { serviceName } } = config;

export const followQueue = new BullQueue(`${config.redisConfig.scope}:profile:follow`, {
  redis: redisUrl,
});

export const blockQueue = new BullQueue(`${config.redisConfig.scope}:profile:block`, {
  redis: redisUrl
});

export const addToFollowQueue = async (followData: any, options: JobOptions = {}) => {
  getIO().to(followData.followingId).emit(socketEventTypes.FOLLOWED_YOU, followData);
  getIO().to(followData.followerId).emit(socketEventTypes.YOU_FOLLOWED, followData);
  followQueue.add('User-Follow', followData, options);
};

export const addToFollowRequestQueue = async (followData: any, options: JobOptions = {}) => {
  // getIO().to(followingData.followingId).emit()
  // getIO().to(followingData.followerId).emit()
};

export const addToUnFollowQueue = async (followData: any, options: JobOptions = {}) => {
  getIO().to(followData.followingId).emit(socketEventTypes.UNFOLLOWED_YOU, followData);
  getIO().to(followData.followerId).emit(socketEventTypes.YOU_UNFOLLOWED, followData);
  followQueue.add('User-Unfollow', followData, options);
};

export const addToBlockQueue = async (blockData: any, options: JobOptions = {}) => {
  // getIO().to(followingData.followingId).emit()
  // getIO().to(followingData.followerId).emit()
};

export const addToUnblockQueue = async (blockData: any, options: JobOptions = {}) => {
  // getIO().to(followingData.followingId).emit()
  // getIO().to(followingData.followerId).emit()
};

export const publishFollow = async (job: Job) => {
  const redis = getRedis();
  const channel = getChannel();
  try {
    job.progress(25);
    await job.log('Publishing Follow');
    const serviceQueues = await getServiceQueues(redis, scope || '');
    const se = new ServiceEvent('USER_FOLLOWED_USER', job.data, null, null, serviceName, serviceQueues);
    await sendToServiceQueues(channel, se, serviceQueues);
    job.log('New Follow published');
    job.progress(100);
    await job.moveToCompleted();
  } catch (error: any) {
    console.log({ error });
  } finally {
    setTimeout(async () => {
      await job.remove();
    }, 5000);
  }
};

export const publishFollowRequest = async (job: Job) => {
  const redis = getRedis();
  const channel = getChannel();
  try {
    job.progress(25);
    await job.log('Publishing Follow Request');
    const serviceQueues = await getServiceQueues(redis, scope || '');
    const se = new ServiceEvent('USER_SENT_FOLLOW_REQUEST', job.data, null, null, serviceName, serviceQueues);
    await sendToServiceQueues(channel, se, serviceQueues);
    job.log('New Follow Request published');
    job.progress(100);
    await job.moveToCompleted();
  } catch (error: any) {
    console.log({ error });
  } finally {
    setTimeout(async () => {
      await job.remove();
    }, 5000);
  }
};

export const publishUnfollow = async (job: Job) => {
  const redis = getRedis();
  const channel = getChannel();
  try {
    job.progress(25);
    await job.log('Publishing UnFollow');
    const serviceQueues = await getServiceQueues(redis, scope || '');
    const se = new ServiceEvent('USER_UNFOLLOWED_USER', job.data, null, null, serviceName, serviceQueues);
    await sendToServiceQueues(channel, se, serviceQueues);
    job.log('UnFollow published');
    job.progress(100);
    await job.moveToCompleted();
  } catch (error: any) {
    console.log({ error });
  } finally {
    setTimeout(async () => {
      await job.remove();
    }, 5000);
  }
};

export const publishBlock = async (job: Job) => {
  const redis = getRedis();
  const channel = getChannel();
  try {
    job.progress(25);
    await job.log('Publishing User Block');
    const serviceQueues = await getServiceQueues(redis, scope || '');
    const se = new ServiceEvent('USER_BLOCKED_USER', job.data, null, null, serviceName, serviceQueues);
    await sendToServiceQueues(channel, se, serviceQueues);
    job.log('User Block published');
    job.progress(100);
    await job.moveToCompleted();
  } catch (error: any) {
    console.log({ error });
  } finally {
    setTimeout(async () => {
      await job.remove();
    }, 5000);
  }
};

export const publishUnblock = async (job: Job) => {
  const redis = getRedis();
  const channel = getChannel();
  try {
    job.progress(25);
    await job.log('Publishing User Unblock');
    const serviceQueues = await getServiceQueues(redis, scope || '');
    const se = new ServiceEvent('USER_UNBLOCKED_USER', job.data, null, null, serviceName, serviceQueues);
    await sendToServiceQueues(channel, se, serviceQueues);
    job.log('User Unblock published');
    job.progress(100);
    await job.moveToCompleted();
  } catch (error: any) {
    console.log({ error });
  } finally {
    setTimeout(async () => {
      await job.remove();
    }, 5000);
  }
};

followQueue.process('User-Follow', publishFollow);
followQueue.process('User-Follow-Request', publishFollowRequest);
followQueue.process('User-Unfollow', publishUnfollow);
blockQueue.process('User-Block', publishBlock);
blockQueue.process('User-Unblock', publishUnblock);
