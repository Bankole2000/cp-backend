import { getIO, isValidDate, ServiceResponse } from '@cribplug/common';
import { Request, response, Response } from 'express';
import fs, { PathLike } from 'fs';
import { logResponse } from '../middleware/logRequests';
import PBService from '../services/pb.service';
import PostDBService from '../services/post.service';
import { addPostToModerationQueue, addToPostLikeQueue, addToPostUnlikeQueue } from '../services/queue/moderationQueue';
import { config } from '../utils/config';
import { moderationStatus, moderationActions } from '../utils/common';
import { socketEventTypes } from '../schema/socket.schema';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const FormData = require('form-data');

const PS = new PostDBService();
const pb = new PBService(config.pocketbase.url || '');

const deleteUploadedFile = (filePath: PathLike) => {
  fs.unlinkSync(filePath);
};

export const createPostIntentHandler = async (req: Request, res: Response) => {
  const { user } = req;
  if (!user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'POST_SERVICE_USER_NOT_AUTHENTICATED', 'You must be logged in to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  await pb.saveAuth(user.pbToken, user.pbUser);
  const pbPost = await pb.createPost({ createdBy: user.userId });
  if (!pbPost.success) {
    await logResponse(req, pbPost);
    return res.status(pbPost.statusCode).send(pbPost);
  }
  delete pbPost.data.expand;
  delete pbPost.data.collectionId;
  delete pbPost.data.collectionName;
  const postData = {
    ...pbPost.data,
    created: new Date(pbPost.data.created),
    updated: new Date(pbPost.data.updated),
    repostId: req.query.repostId ? req.query.repostId as string : null
  };
  const sr = await PS.createPostIntent(postData);
  await logResponse(req, sr);
  if (res.locals.newAccessToken) {
    sr.newAccessToken = res.locals.newAccessToken;
  }
  return res.status(sr.statusCode).send(sr);
};

export const createRepostHandler = async (req: Request, res: Response) => {
  const { user } = req;
  const { postId } = req.params;
  if (!user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'POST_SERVICE_USER_NOT_AUTHENTICATED', 'You must be logged in to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  const uHasReposted = await PS.checkUserHasReposted(postId, user.userId);
  if (uHasReposted.success) {
    uHasReposted.message = 'You have reposted this post before';
    return res.status(uHasReposted.statusCode).send(uHasReposted);
  }
  const repost = await PS.createRepost(postId, user.userId);
  if (!repost.success) {
    return res.status(repost.statusCode).send(repost);
  }
  const autoModerate = true;
  const contentWarning = false;
  const postModeration = await PS
    .addPostToModerationQueue(
      repost.data.id,
      moderationStatus.PENDING,
      autoModerate,
      contentWarning
    );
  if (postModeration.success) {
    const delay = postModeration.data.publishAt
      ? Date.parse(postModeration.data.publishAt) - Date.now()
      : 100;
    await addPostToModerationQueue(postModeration.data, { delay });
    console.log('Sending response');
    postModeration.message = 'Reposted Successfully';
    repost.data.repostCount = (await PS.getRepostCount(repost.data.repostId)).data;
    repost.data.repostOnlyCount = (await PS.getRepostOnlyCount(repost.data.repostId)).data;
    repost.data.quoteRepostCount = (await PS.getQuoteRepostOnlyCount(repost.data.repostId)).data;
    getIO().emit(socketEventTypes.POST_REPOSTED, repost.data);
  }
  return res.status(postModeration.statusCode).send(postModeration);
};

export const undoRepostHandler = async (req: Request, res: Response) => {
  const { user } = req;
  const { postId } = req.params;
  if (!user) {
    const sr = new ServiceResponse('Unauthenticated', null, false, 401, 'Unauthenticated', 'POST_SERVICE_USER_NOT_AUTHENTICATED', 'You must be logged in to perform this action');
    return res.status(sr.statusCode).send(sr);
  }
  const uHasReposted = await PS.checkUserHasReposted(postId, user.userId);
  if (!uHasReposted.success) {
    uHasReposted.message = 'You have not reposted this post before';
    return res.status(uHasReposted.statusCode).send(uHasReposted);
  }
  const sr = await PS.undoRepost(uHasReposted.data.id);
  sr.data.repostCount = (await PS.getRepostCount(sr.data.repostId)).data;
  sr.data.repostOnlyCount = (await PS.getRepostOnlyCount(sr.data.repostId)).data;
  sr.data.quoteRepostOnlyCount = (await PS.getQuoteRepostOnlyCount(sr.data.repostId)).data;
  if (sr.success) {
    getIO()
      .emit(socketEventTypes.REPOST_UNDONE, sr.data);
  }
  return res.status(sr.statusCode).send(sr);
};

export const getQuotePostsHandler = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { user } = req;
  let limit: number;
  let page: number;
  let filter: string;
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
  if (req.query.sort) {
    filter = req.query.sort as string;
  } else {
    filter = 'latest';
  }
  const sr = await PS.getQuotePosts(postId, page, limit, filter, user ? user.userId : null);
  return res.status(sr.statusCode).send(sr);
};

export const getRepostedByHandler = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const { user } = req;
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
  const sr = await PS.getRepostedBy(postId, page, limit, user ? user.userId : null);
  return res.status(sr.statusCode).send(sr);
};

export const addPostMediaHandler = async (req: Request, res: Response) => {
  const { postId } = req.params;
  console.log({ body: req.body });
  if (!req.body.type || !['IMAGE', 'GIF'].includes(req.body.type)) {
    if (req.file) {
      deleteUploadedFile(req.file?.path);
    }
    const sr = new ServiceResponse('Invalid Media Type', null, false, 400, 'Invalid Media Type', 'POST_SERVICE_ERROR_INVALID_MEDIA_TYPE', 'Media Type should be indicated in request body');
    return res.status(sr.statusCode).send(sr);
  }
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  const form = new FormData();
  console.log('Creating form data');
  if (req.file) {
    form.append('image', fs.createReadStream(req.file?.path as PathLike));
  }
  form.append('post', postId);
  form.append('type', req.body.type);
  console.log('Adding form details');
  console.log('Data added');
  const { data: existingPM } = await pb.getAllPostMedia(postId);
  console.log('line 63');
  const pbPM = req.body.type === 'GIF' ? await pb.addPostGif({ type: req.body.type, data: req.body.data, post: postId }) : await pb.addPostMedia(form);
  console.log('line 65');
  if (!pbPM.success) {
    await logResponse(req, pbPM);
    return res.status(pbPM.statusCode).send(pbPM);
  }
  let imageUrl = req.body.imageUrl || '';
  if (req.body.type === 'IMAGE') {
    imageUrl = await pb.generateImageUrl(pbPM.data, pbPM.data.image);
    deleteUploadedFile(req.file?.path as PathLike);
  } else if (req.body.type === 'GIF') {
    imageUrl = req.body.data.url;
  }
  delete pbPM.data.collectionId;
  delete pbPM.data.expand;
  delete pbPM.data.collectionName;
  pbPM.data.created = new Date(pbPM.data.created);
  pbPM.data.updated = new Date(pbPM.data.updated);
  const postMediaData = {
    ...pbPM.data,
    data: pbPM.data.data ? pbPM.data.data : {},
    image: req.body.type === 'GIF' ? req.body.id : pbPM.data.image,
    order: !existingPM ? 0 : existingPM.length,
    imageUrl
  };
  const sr = await PS.addPostMedia(postMediaData);
  return res.status(sr.statusCode).send(sr);
};

export const getPostDetailsHandler = async (req: Request, res: Response) => {
  const { postId } = req.params;
  console.log('getting post details');
  const sr = await PS.getPostDetails(postId, req.user?.userId);
  if (res.locals.newAccessToken) {
    sr.newAccessToken = res.locals.newAccessToken;
  }
  return res.status(sr.statusCode).send(sr);
};

export const removePostMediaHandler = async (req: Request, res: Response) => {
  const { mediaId, postId } = req.params;
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  const { data: mediaList, success: listSuccess } = await pb.getAllPostMedia(postId);
  const delMedia = await pb.deletePBResource('postMedia', mediaId);
  if (!delMedia.success) {
    return res.status(delMedia.statusCode).send(delMedia);
  }
  const sr = await PS.deletePostMedia(mediaId);
  if (sr.success && listSuccess) {
    if (sr.data.order < mediaList.length - 1) {
      const reorderMedia = await PS.reorderPostMediaBackward(
        sr.data.order,
        postId,
        mediaId,
        mediaList.length
      );
      console.log({ reorderMedia });
    }
  }
  return res.status(sr.statusCode).send(sr);
};

export const changePostMediaOrderHandler = async (req: Request, res: Response) => {
  const { mediaId, postId } = req.params;
  const { order } = req.body;
  console.log({ order, type: typeof order });
  if (typeof order !== 'number') {
    const sr = new ServiceResponse('Invalid Order number', null, false, 400, 'Invalid order in request body', 'POST_SERVICE_INVALID_POST_MEDIA_ORDER', 'Check request body and parameters');
    return res.status(sr.statusCode).send(sr);
  }
  const list = await pb.getAllPostMedia(postId);
  if (!list.success) {
    await logResponse(req, list);
    return res.status(list.statusCode).send(list);
  }
  if (order < 0 || order >= list.data.length) {
    const sr = new ServiceResponse('Invalid Ordering Number', null, false, 400, 'Invalid ordering number', 'POST_SERVICE_INVALID_IMAGE_ORDER', 'Check media order input');
    return res.status(sr.statusCode).send(sr);
  }
  const currentOrder = await PS.getMediaById(mediaId);
  if (order === currentOrder.data.order) {
    return res.status(currentOrder.statusCode).send(currentOrder);
  }
  const updatedMedia = await PS.setMediaOrder(mediaId, order);
  if (updatedMedia.success) {
    if (order < currentOrder.data.order) {
      await PS.reorderPostMediaForward(order, postId, mediaId, currentOrder.data.order);
    }
    if (order > currentOrder.data.order) {
      await PS.reorderPostMediaBackward(order, postId, mediaId, currentOrder.data.order);
    }
  }
  return res.status(updatedMedia.statusCode).send(updatedMedia);
};

export const updatePostDetailsHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const deleteUnpublishedPostHandler = async (req: Request, res: Response) => {
  const { postId } = req.params;
  const postMedia = (await PS.getPostMedia(postId)).data;
  await pb.saveAuth(req.user.pbToken, req.user.pbUser);
  if (postMedia.length) {
    const mediaIds = postMedia.map((x: any) => x.id);
    await pb.deleteMultipleRecords('postMedia', mediaIds);
  }
  const result = await pb.deletePBResource('posts', postId);
  if (result.success) {
    const sr = await PS.deletePost(postId);
    return res.status(sr.statusCode).send(sr);
  }
  return res.status(result.statusCode).send(result);
};

export const deletePublishedPostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const updatePostMediaHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const likePostHandler = async (req: Request, res: Response) => {
  const ulikesp = await PS.checkUserLikedPost(req.params.postId, req.user.userId);
  if (ulikesp.success) {
    return res.status(ulikesp.statusCode).send(ulikesp);
  }
  const like = await PS.likePost(req.params.postId, req.user.userId);
  if (like.success) {
    addToPostLikeQueue(like.data);
  }
  return res.status(like.statusCode).send(like);
};

export const unlikePostHandler = async (req: Request, res: Response) => {
  const ulikesp = await PS.checkUserLikedPost(req.params.postId, req.user.userId);
  if (!ulikesp.success) {
    return res.status(ulikesp.statusCode).send(ulikesp);
  }
  const like = await PS.unlikePost(req.params.postId, req.user.userId);
  if (like.success) {
    addToPostUnlikeQueue(like.data);
  }
  return res.status(like.statusCode).send(like);
};

export const getPostLikesHandler = async (req: Request, res: Response) => {
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
  const sr = await PS.getPostLikes(req.params.postId, page, limit, req.user?.userId || null);
  return res.status(sr.statusCode).send(sr);
};

export const setPostCaptionHandler = async (req: Request, res: Response) => {
  const { caption } = req.body;
  const { postId } = req.params;
  if (typeof caption === undefined || caption === null) {
    const sr = new ServiceResponse('Caption is required', null, false, 400, 'Invalid post caption', 'POST_SERVICE_INVALID_POST_CAPTION', 'Check caption in request body');
    return res.status(sr.statusCode).send(sr);
  }
  const sr = await PS.setDraftPostCaption(postId, caption);
  return res.status(sr.statusCode).send(sr);
};

export const setPostPrivacyHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const publishPostHandler = async (req: Request, res: Response) => {
  const { postId } = req.params;
  console.log({ params: req.query, postId });
  if (req.query.caption) {
    console.log({ caption: req.query.caption });
    const sr = await PS.setDraftPostCaption(postId, req.query.caption as string);
    if (!sr.success) {
      return res.status(sr.statusCode).send(sr);
    }
  }
  const postAlreadyOnQueue = await PS.getPostDetails(postId);
  if (postAlreadyOnQueue.data.moderation) {
    if (postAlreadyOnQueue.data.moderation.status === moderationStatus.PENDING) {
      postAlreadyOnQueue.message = postAlreadyOnQueue.data.autoModerate ? 'Post Already Published' : 'Post Awaiting Review';
      return res.status(postAlreadyOnQueue.statusCode).send(postAlreadyOnQueue);
    }
  }
  const { caption, postMedia: media } = postAlreadyOnQueue.data;
  if (!caption && !(media.length > 0)) {
    const sr = new ServiceResponse('Post must have either caption or at least 1 media element', null, false, 400, 'Post content empty', 'POST_SERVICE_POST_HAS_NO_CONTENT', 'Please add a caption or an image/media before publishing');
    return res.status(sr.statusCode).send(sr);
  }
  if (req.query.publishAt) {
    if (!isValidDate(req.query.publishAt as string)) {
      const sr = new ServiceResponse('Invalid publish date / time', null, false, 400, 'Invalid publish date', 'POST_SERVICE_INVALID_PUBLISH_DATE', 'Check date sent in query params');
      return res.status(sr.statusCode).send(sr);
    }
    if (Date.parse(req.query.publishAt as string) < Date.now()) {
      const sr = new ServiceResponse('Publish date needs to be in the future', null, false, 400, 'Invalid publish date', 'POST_SERVICE_INVALID_PUBLISH_DATE', 'Check date sent in query params');
      return res.status(sr.statusCode).send(sr);
    }
  }
  const autoModerate = req.query.autoModerate !== 'false';
  const contentWarning = req.query.contentWarning === 'true';
  const publishAt = isValidDate(req.query.publishAt as string)
    ? new Date(req.query.publishAt as string)
    : null;
  const postModeration = await PS
    .addPostToModerationQueue(
      postId,
      moderationStatus.PENDING,
      autoModerate,
      contentWarning,
      publishAt
    );
  if (postModeration.success) {
    const delay = postModeration.data.publishAt
      ? Date.parse(postModeration.data.publishAt) - Date.now()
      : 10000;
    await addPostToModerationQueue(postModeration.data, { delay });
  }
  console.log('Sending response');
  postModeration.message = autoModerate ? 'Post Published' : 'Post sent for review';
  return res.status(postModeration.statusCode).send(postModeration);
};

export const postPublishHandler = async (req: Request, res: Response) => {
  const { postId } = req.params;
  console.log({ params: req.query, postId, body: req.body });
  if (req.body.caption) {
    console.log({ caption: req.body.caption });
    const sr = await PS.setDraftPostCaption(postId, req.body.caption as string);
    if (!sr.success) {
      return res.status(sr.statusCode).send(sr);
    }
  }
  const postAlreadyOnQueue = await PS.getPostDetails(postId);
  if (postAlreadyOnQueue.data.moderation) {
    if (postAlreadyOnQueue.data.moderation.status === moderationStatus.PENDING) {
      postAlreadyOnQueue.message = postAlreadyOnQueue.data.autoModerate ? 'Post Already Published' : 'Post Awaiting Review';
      return res.status(postAlreadyOnQueue.statusCode).send(postAlreadyOnQueue);
    }
  }
  const { caption, postMedia: media } = postAlreadyOnQueue.data;
  if (!caption && !(media.length > 0)) {
    const sr = new ServiceResponse('Post must have either caption or at least 1 media element', null, false, 400, 'Post content empty', 'POST_SERVICE_POST_HAS_NO_CONTENT', 'Please add a caption or an image/media before publishing');
    return res.status(sr.statusCode).send(sr);
  }
  if (req.body.publishAt) {
    if (!isValidDate(req.body.publishAt as string)) {
      const sr = new ServiceResponse('Invalid publish date / time', null, false, 400, 'Invalid publish date', 'POST_SERVICE_INVALID_PUBLISH_DATE', 'Check date sent in body params');
      return res.status(sr.statusCode).send(sr);
    }
    if (Date.parse(req.body.publishAt as string) < Date.now()) {
      const sr = new ServiceResponse('Publish date needs to be in the future', null, false, 400, 'Invalid publish date', 'POST_SERVICE_INVALID_PUBLISH_DATE', 'Check date sent in body params');
      return res.status(sr.statusCode).send(sr);
    }
  }
  const autoModerate = req.body.autoModerate !== 'false';
  const contentWarning = req.body.contentWarning === 'true';
  const publishAt = isValidDate(req.body.publishAt as string)
    ? new Date(req.body.publishAt as string)
    : null;
  const postModeration = await PS
    .addPostToModerationQueue(
      postId,
      moderationStatus.PENDING,
      autoModerate,
      contentWarning,
      publishAt
    );
  if (postModeration.success) {
    const delay = postModeration.data.publishAt
      ? Date.parse(postModeration.data.publishAt) - Date.now()
      : 10000;
    await addPostToModerationQueue(postModeration.data, { delay });
  }
  console.log('Sending response');
  postModeration.message = autoModerate ? 'Post Published' : 'Post sent for review';
  return res.status(postModeration.statusCode).send(postModeration);
};

export const unpublishPostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const getLatestPublishedPostsHandler = async (req: Request, res: Response) => {
  const { user } = req;
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
  const sr = await PS.getLatestPublishedPosts(page, limit, user ? user.userId : null);
  if (res.locals.newAccessToken) {
    sr.newAccessToken = res.locals.newAccessToken;
  }
  return res.status(sr.statusCode).send(sr);
};

export const pinPostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};

export const unpinPostHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  return res.status(sr.statusCode).send(sr);
};
