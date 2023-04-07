import { getIO, ServiceEvent, contentModerationRoles } from '@cribplug/common';
import BullQueue, { Job, JobOptions } from 'bull';
import { socketEventTypes } from '../../schema/socket.schema';
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

export const likeQueue = new BullQueue(`${config.redisConfig.scope}:post:liked`, {
  redis: redisUrl
});

export const commentQueue = new BullQueue(`${config.redisConfig.scope}:comment:publishing`, {
  redis: redisUrl,
  settings: {
    maxStalledCount: 0,
  }
});

export const unlikeQueue = new BullQueue(`${config.redisConfig.scope}:post:unliked`, {
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

export const addCommentToPublishingQueue = async (commentData: any, options: JobOptions = {}) => {
  await commentQueue.add('Comment-Publishing', commentData, options);
};

export const addCommentToDeleteQueue = async (commentData: any, options: JobOptions = {}) => {
  commentQueue.add('Comment-Deleting', commentData, options);
};

export const addCommentToReplyQueue = async (commentData: any, options: JobOptions = {}) => {
  commentQueue.add('Comment-Reply-Publishing', commentData, options);
};

export const addToCommentLikeQueue = async (commentData: any, options: JobOptions = {}) => {
  commentQueue.add('Comment-Liked', commentData, options);
};

export const addToCommentUnlikeQueue = async (commentData: any, options: JobOptions = {}) => {
  commentQueue.add('Comment-Unliked', commentData, options);
};

export const addToPostLikeQueue = (likeData: string, options: JobOptions = {}) => {
  likeQueue.add('Post-Liked', likeData, options);
};

export const addToPostUnlikeQueue = (likeData: string, options: JobOptions = {}) => {
  likeQueue.add('Post-Unliked', likeData, options);
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
  const post = await postService.getPostDetails(published.data.id, published.data.createdBy);
  getIO().to(published.data.createdBy).emit(socketEventTypes.POST_PUBLISHED, post.data);
  job.log('Post Published');
  job.progress(100);
  await job.moveToCompleted();
  await job.remove();
  console.log(result);
};

export const likedPost = async (job: Job) => {
  console.log({ job });
  const redis = getRedis();
  const channel = getChannel();
  job.progress(50);
  await job.log('Marking post as liked by user');
  job.progress(75);
  job.log('Publishing Post like');
  getIO().emit(socketEventTypes.POST_LIKED, job.data);
  const serviceQueues = await getServiceQueues(redis, scope || '');
  const se = new ServiceEvent(
    socketEventTypes.POST_LIKED,
    job.data,
    null,
    null,
    serviceName,
    serviceQueues
  );
  const result = await sendToServiceQueues(channel, se, serviceQueues);
  job.log('Post like Published');
  job.progress(100);
  await job.moveToCompleted();
  await job.remove();
  console.log(result);
};

export const unlikedPost = async (job: Job) => {
  console.log({ job });
  const redis = getRedis();
  const channel = getChannel();
  job.progress(50);
  await job.log('Marking post as unliked by user');
  job.progress(75);
  job.log('Publishing Post unlike');
  getIO().emit(socketEventTypes.POST_UNLIKED, job.data);
  const serviceQueues = await getServiceQueues(redis, scope || '');
  const se = new ServiceEvent(
    socketEventTypes.POST_UNLIKED,
    job.data,
    null,
    null,
    serviceName,
    serviceQueues
  );
  const result = await sendToServiceQueues(channel, se, serviceQueues);
  job.log('Post unlike Published');
  job.progress(100);
  await job.moveToCompleted();
  await job.remove();
  console.log(result);
};

export const rejectPost = async (job: Job) => {
  console.log({ job });
  console.log('Post rejected');
};

export const publishComment = async (job: Job) => {
  console.log({ job });
  const redis = getRedis();
  const channel = getChannel();
  const io = getIO();
  job.progress(25);
  await job.log('Publishing comment');
  const serviceQueues = await getServiceQueues(redis, scope || '');
  let se: ServiceEvent;
  if (!job.data.parentCommentId) {
    se = new ServiceEvent('COMMENT_PUBLISHED', job.data, null, null, serviceName, serviceQueues);
  } else {
    se = new ServiceEvent('COMMENT_REPLY_PUBLISHED', job.data, null, null, serviceName, serviceQueues);
  }
  const result = await sendToServiceQueues(channel, se, serviceQueues);
  if (!job.data.parentCommentId) {
    io.in(job.data.postId).emit(socketEventTypes.COMMENT_PUBLISHED, job.data);
  } else {
    io.in(job.data.postId).emit(socketEventTypes.COMMENT_REPLY_PUBLISHED, job.data);
  }
  console.log({ result, comment: job.data });
  await job.log('Comment published');
  job.progress(100);
  await job.moveToCompleted();
  await job.remove();
  // setTimeout(async () => {
  // }, 200000);
};

export const deleteComment = async (job: Job) => {
  console.log({ job });
};

export const publishCommentReply = async (job: Job) => {
  console.log({ job });
};

export const likeComment = async (job: Job) => {
  console.log({ job });
  const redis = getRedis();
  const channel = getChannel();
  const io = getIO();
  job.progress(25);
  await job.log('Publishing comment like');
  const serviceQueues = await getServiceQueues(redis, scope || '');
  let se: ServiceEvent;
  if (!job.data.parentCommentId) {
    se = new ServiceEvent(
      socketEventTypes.COMMENT_LIKED,
      job.data,
      null,
      null,
      serviceName,
      serviceQueues
    );
  } else {
    se = new ServiceEvent(
      socketEventTypes.COMMENT_REPLY_LIKED,
      job.data,
      null,
      null,
      serviceName,
      serviceQueues
    );
  }
  const result = await sendToServiceQueues(channel, se, serviceQueues);
  if (!job.data.comment.parentCommentId) {
    io.in(job.data.comment.postId).emit(socketEventTypes.COMMENT_LIKED, job.data);
  } else {
    io.in(job.data.comment.postId).emit(socketEventTypes.COMMENT_REPLY_LIKED, job.data);
  }
  console.log({ result, comment: job.data });
  await job.log('Comment like published');
  job.progress(100);
  await job.moveToCompleted();
  await job.remove();
};

export const unlikeComment = async (job: Job) => {
  console.log({ job });
};

moderationQueue.process('Post-Moderation', moderatePost);
publishingQueue.process('Post-Publishing', publishPost);
publishingQueue.process('Post-Rejection', rejectPost);
likeQueue.process('Post-Liked', likedPost);
likeQueue.process('Post-Unliked', unlikedPost);
commentQueue.process('Comment-Publishing', publishComment);
commentQueue.process('Comment-Deleting', deleteComment);
commentQueue.process('Comment-Reply-Publishing', publishCommentReply);
commentQueue.process('Comment-Liked', likeComment);
commentQueue.process('Comment-Unliked', unlikeComment);
