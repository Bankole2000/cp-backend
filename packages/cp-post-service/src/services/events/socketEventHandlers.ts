import { socketEventTypes } from '../../schema/socket.schema';
import TagDBService from '../tag.service';

const tagService = new TagDBService();

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

export const socketEvents = {
  [socketEventTypes.SEARCH_TAGS]: SEARCH_TAGS_HANDLER
};
