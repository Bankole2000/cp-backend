import { socketEventTypes } from '../../schema/socket.schema';
import NotificationDBService from '../notification.service';
import UserDBService from '../user.service';

const userService = new UserDBService();
const ns = new NotificationDBService();

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

const ALL_NOTIFICATIONS_SEEN_HANDLER = async (data: any, socket: any, io: any) => {
  const user = await userService.findUserById(data.userId);
  console.log({ data });
  if (!user.success) {
    return;
  }
  const seen = await ns.markAllUserNotificationsAsSeen(data.userId);
  if (seen.success) {
    await io.to(data.userId).emit(socketEventTypes.ALL_NOTIFICATIONS_SEEN, seen);
  }
};

const ALL_NOTIFICATIONS_READ_HANDLER = async (data: any, socket: any, io: any) => {
  const user = await userService.findUserById(data.userId);
  if (!user.success) {
    return;
  }
  const read = await ns.markAllUserNotificationsAsRead(data.userId);
  if (read.success) {
    await io.to(data.userId).emit(socketEventTypes.ALL_NOTIFICATIONS_READ, read);
  }
};

const NOTIFICATION_READ_HANDLER = async (data: any, socket: any, io: any) => {
  const user = await userService.findUserById(data.userId);
  if (!user.success) {
    return;
  }
  const read = await ns.markNotificationAsRead(data.userId, data.notificationId);
  if (read.success) {
    await io.to(data.userId).emit(socketEventTypes.NOTIFICATION_READ, read.data);
  }
};

export const socketEvents = {
  [socketEventTypes.USER_CONNECTED]: USER_CONNECTED_HANDLER,
  [socketEventTypes.ALL_NOTIFICATIONS_SEEN]: ALL_NOTIFICATIONS_SEEN_HANDLER,
  [socketEventTypes.ALL_NOTIFICATIONS_READ]: ALL_NOTIFICATIONS_READ_HANDLER,
  [socketEventTypes.NOTIFICATION_READ]: NOTIFICATION_READ_HANDLER
};
