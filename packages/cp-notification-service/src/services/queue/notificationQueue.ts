import { getIO, ServiceEvent } from '@cribplug/common';
import BullQueue, { Job, JobOptions } from 'bull';
import {
  isOverHoursOld,
  notificationMessages,
  notificationTypes,
  resourceTypes
} from '../../schema/notification.schema';
import { getRedis, getChannel } from '../../utils/common';
import { config } from '../../utils/config';
import NotificationDBService from '../notification.service';
import { getServiceQueues, sendToServiceQueues } from '../events.service';

const ns = new NotificationDBService();

const { redisConfig: { scope, url: redisUrl }, self: { serviceName } } = config;

export const notificationQueue = new BullQueue(`${config.redisConfig.scope}:notification`, {
  redis: redisUrl,
});

export const addToFollowerNotificationQueue = async (followData: any, options: JobOptions = {}) => {
  notificationQueue.add('New-Follower', followData, options);
};

export const newFollowerNotification = async (job: Job) => {
  const redis = getRedis();
  const channel = getChannel();
  const { follower, following } = job.data;
  job.progress(25);
  job.log('Creating Follow notification');
  const type = notificationTypes.FOLLOWED_YOU;
  const message = notificationMessages[type](follower.username);
  const resourceType = resourceTypes.PROFILE;
  const resourceId = follower.username;
  const resourceData = job.data;
  const nExists = await ns.checkNotificationAlreadyExists(
    following.userId,
    type,
    message,
    resourceType,
    resourceId
  );
  if (nExists.success && !isOverHoursOld(nExists.data.notification.createdAt, 1)) {
    console.log({
      nExists,
      isOverHoursOld: !isOverHoursOld(nExists.data.notification.createdAt, 1)
    });
    job.progress(100);
    job.log('Notification already exists');
    await job.moveToCompleted();
    setTimeout(async () => {
      await job.remove();
    }, 10000);
    return;
  }
  const notification = await ns.createUserNotification(
    following.userId,
    {
      type,
      message,
      resourceType,
      resourceId,
      resourceData
    }
  );
  if (notification.success) {
    job.progress(50);
    job.log('Follow notification created');
    notification.message = message;
    getIO().to(following.userId).emit('NEW_NOTIFICATION', notification);
    job.progress(75);
    job.log('Notification socket event emitted');
    await job.log('Publishing NEW_FOLLOW_NOTIFICATION event');
    const commsQueue = await getServiceQueues(redis, scope || '', ['comms', 'event']);
    const se = new ServiceEvent('NEW_FOLLOW_NOTIFICATION', { notification: notification.data, data: job.data }, null, null, serviceName, commsQueue);
    await sendToServiceQueues(channel, se, commsQueue);
    await job.log('NEW_FOLLOW_NOTIFICATION event published');
    job.progress(100);
    await job.moveToCompleted();
    setTimeout(async () => {
      await job.remove();
    }, 10000);
    return;
  }
  job.log('Error creating notification');
  await job.moveToFailed({ message: notification.error as string });
};

notificationQueue.process('New-Follower', newFollowerNotification);
