import { socketEventTypes } from '../../schema/socket.schema';
import ProfileDBService from '../profile.service';
import UserDBService from '../user.service';

const userService = new UserDBService();
const profileService = new ProfileDBService();

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

const TAGGABLE_PROFILES_HANDLER = async (data: any, socket: any, io: any) => {
  const {
    userId,
    q,
    page,
    limit
  } = data;
  let result;
  if (q) {
    result = await profileService.searchAllProfiles(q, page, limit, userId);
  } else {
    result = await profileService.getTaggableProfiles(userId, limit);
  }
  io.to(socket.id).emit(socketEventTypes.TAGGABLE_PROFILES, result);
};

export const socketEvents = {
  [socketEventTypes.USER_CONNECTED]: USER_CONNECTED_HANDLER,
  [socketEventTypes.TAGGABLE_PROFILES]: TAGGABLE_PROFILES_HANDLER
};
