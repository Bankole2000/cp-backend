import { socketEventTypes } from '../../schema/socket.schema';
import CommentDBService from '../comment.service';
import PostDBService from '../post.service';
import { addToPostLikeQueue, addToPostUnlikeQueue } from '../queue/moderationQueue';
import TagDBService from '../tag.service';
import UserDBService from '../user.service';

const tagService = new TagDBService();
const postService = new PostDBService();
const userService = new UserDBService();
const commentService = new CommentDBService();

const USER_CONNECTED_HANDLER = async (data: any, socket: any, io: any) => {
  const rooms = io.sockets.adapter.sids.get(socket.id);
  console.log({ rooms, id: socket.id });
  console.log({ oldRooms: rooms?.values() });
  Array.from(rooms as Set<string>).forEach(async (room: string) => {
    if (room !== socket.id) {
      await socket.leave(room);
    }
  });
  const user = await userService.findUserById(data.userId);
  if (user.success) {
    await socket.join(data.userId);
    io.to(data.userId).emit('USER_CONNECTED', user.data);
  }
};

const POST_CONNECTED_HANDLER = async (data: any, socket: any, io: any) => {
  console.log('handling POST_CONNECTED socket event');
  const post = await postService.getPostById(data.postId);
  if (post.success) {
    await socket.join(data.postId);
  }
  return post.success;
};

const SEARCH_TAGS_HANDLER = async (data: any, socket: any, io: any) => {
  const { page, limit, q } = data;
  let result;
  if (q) {
    result = await tagService.searchTags(q, page, limit);
  } else {
    result = await tagService.getTags(page, limit);
  }
  io.to(socket.id).emit(socketEventTypes.SEARCH_TAGS, result);
};

const POST_LIKED_HANDLER = async (data: any, socket: any, io: any) => {
  console.log('User liked post');
  const ulikesp = await postService.checkUserLikedPost(data.postId, data.userId);
  if (ulikesp.success) {
    return;
  }
  const like = await postService.likePost(data.postId, data.userId);
  if (like.success) {
    addToPostLikeQueue(like.data);
  }
};

const POST_UNLIKED_HANDLER = async (data: any, socket: any, io: any) => {
  console.log('User unliked post');
  const ulikesp = await postService.checkUserLikedPost(data.postId, data.userId);
  if (!ulikesp.success) {
    return;
  }
  const like = await postService.unlikePost(data.postId, data.userId);
  if (like.success) {
    addToPostUnlikeQueue(like.data);
  }
};

const GET_REPOST_COUNT_HANDLER = async (data: any, socket: any, io: any) => {
  console.log('Getting repost count');
  const repostCount = await postService.getRepostCount(data.postId);
  io.to(socket.id).emit(socketEventTypes.GET_REPOST_COUNT, repostCount.data);
  return repostCount.data;
};

const GET_NEW_COMMENT_HANDLER = async (data: any, socket: any, io: any) => {
  const { userId, commentId, postId } = data;
  const newComment = await commentService.getCommentDetails(commentId, postId, userId);
  return newComment.data;
};

export const socketEvents = {
  [socketEventTypes.USER_CONNECTED]: USER_CONNECTED_HANDLER,
  [socketEventTypes.SEARCH_TAGS]: SEARCH_TAGS_HANDLER,
  [socketEventTypes.POST_LIKED]: POST_LIKED_HANDLER,
  [socketEventTypes.POST_UNLIKED]: POST_UNLIKED_HANDLER,
  [socketEventTypes.GET_REPOST_COUNT]: GET_REPOST_COUNT_HANDLER,
  [socketEventTypes.POST_CONNECTED]: POST_CONNECTED_HANDLER,
  [socketEventTypes.GET_NEW_COMMENT]: GET_NEW_COMMENT_HANDLER,
};
