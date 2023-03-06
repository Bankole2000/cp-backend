import { getIO, ServiceEvent, contentModerationRoles } from '@cribplug/common';
import BullQueue, { Job, JobOptions } from 'bull';
import {
  getChannel,
  getRedis,
  moderationActions,
  moderationStatus
} from '../../utils/common';
import { config } from '../../utils/config';
import { getServiceQueues, sendToServiceQueues } from '../events.service';
import ModerationDBService from '../moderation.service';
import PostDBService from '../post.service';
import UserDBService from '../user.service';

const { redisConfig: { scope, url: redisUrl }, self: { serviceName } } = config;
const postService = new PostDBService();
const userService = new UserDBService();
const moderationService = new ModerationDBService();

export const moderationQueue = new BullQueue(`${config.redisConfig.scope}:post:moderation`, {
  redis: redisUrl
});

export const publishingQueue = new BullQueue(`${config.redisConfig.scope}:post:publishing`, {
  redis: redisUrl
});

export const addPostToModerationQueue = async (postData: any, options: JobOptions = {}) => {
  const { data: moderators } = await userService.getUsersByRoles(contentModerationRoles);
  console.log('here');
  console.log({ moderators });
  if (moderators) {
    const moderatorIds = moderators.map((x: any) => x.userId);
    getIO().to(moderatorIds).emit('POST_AWAITING_MODERATION', postData);
  }
  await moderationQueue.add('Post-Moderation', postData, options);
  console.log('Post added to moderation queue');
  console.table({
    id: postData.postId,
    caption: postData.post.caption,
    media: postData.post.postMedia.length
  });
};

export const addToPublishingQueue = (postData: string, options: JobOptions = {}) => {
  publishingQueue.add('Post-Publishing', postData, options);
};

export const addToRejectionQueue = (postData: string, options: JobOptions = {}) => {
  publishingQueue.add('Post-Rejection', postData, options);
};

const moderatePost = async (job: Job,) => {
  console.log({ data: job.data });
  const { data, success } = await moderationService.getModerationDetails(job.data.postId);
  job.update(data);
  await job.log('Fetched moderation data');
  job.progress(25);
  if (!success || data.post.published) {
    await job.log('Error, Job already published or not found');
    await job.moveToCompleted();
    await job.remove();
    return;
  }
  if (data.autoModerate) {
    job.log('Auto Moderating');
    if (!data.moderated) {
      // TODO: implemement automatic content moderation here
      job.log('Generating Automatic moderation review');
      const amResult = await moderationService.createModerationReview(data.postId, moderationActions.AUTO_APPROVED, 'Post Auto Approved', null, false, null, data.contentWarning);
      if (amResult.success) {
        job.update(amResult.data);
        job.progress(50);
        job.log('Automatic moderation review complete');
        const delay = job.data.publishAt ? Date.parse(job.data.publishAt) - Date.now() : -1;
        const options: JobOptions = delay > 0 ? { delay } : {};
        addToPublishingQueue(job.data.post, options);
        job.progress(100);
        job.log('Post queued for publishing');
        await job.moveToCompleted();
        job.log(`Post ${job.data.postId} auto moderated`);
        await job.remove();
        return;
      }
      job.log('Error adding moderation review');
      job.moveToFailed({ message: amResult.errors as string });
      return;
    }
    job.log('Post already Moderated');
    if (data.status === moderationActions.REJECTED) {
      job.log('Moderator rejected post');
      job.progress(50);
      addToRejectionQueue(job.data);
      job.progress(100);
      job.log('Post queued for rejection');
      await job.moveToCompleted();
      console.log(`Post ${job.data.postId} rejected by moderator`);
      await job.remove();
      return;
    }
    if (data.status === moderationActions.APPROVED) {
      job.log('Moderator approved post');
      job.progress(50);
      const delay = job.data.publishAt ? Date.parse(job.data.publishAt) - Date.now() : -1;
      const options: JobOptions = delay > 0 ? { delay } : {};
      addToPublishingQueue(job.data.post, options);
      job.progress(100);
      job.log('Post queued for publishing');
      await job.moveToCompleted();
      console.log(`Post ${job.data.postId} approved by moderated`);
      await job.remove();
      return;
    }
    job.log('Unknown / Unhandled Moderation Status / Action');
  }
  await job.moveToCompleted();
  await job.remove();
  console.log('Post moderated');
};

export const publishPost = async (job: Job) => {
  console.log({ job });
  const redis = getRedis();
  const channel = getChannel();
  job.progress(25);
  await job.log('Marking post as published');
  const published = await postService.markPostAsPublished(job.data.id, job.data.caption || '');
  job.progress(50);
  if (!published.success) {
    await job.log('Error Marking post as published');
    await job.log(published.error as string);
    job.moveToFailed({ message: published.message });
  }
  job.log('Post marked as published');
  job.update(published.data);
  job.progress(75);
  job.log('Publishing Post');
  const serviceQueues = await getServiceQueues(redis, scope || '');
  const se = new ServiceEvent('POST_PUBLISHED', published.data, null, null, serviceName, serviceQueues);
  const result = await sendToServiceQueues(channel, se, serviceQueues);
  job.log('Post Published');
  job.progress(100);
  await job.moveToCompleted();
  await job.remove();
  console.log(result);
};

export const rejectPost = async (job: Job) => {
  console.log({ job });
  console.log('Post rejected');
};

moderationQueue.process('Post-Moderation', moderatePost);
publishingQueue.process('Post-Publishing', publishPost);
publishingQueue.process('Post-Rejection', rejectPost);
