export const resourceTypes = {
  PROFILE: 'PROFILE',
  POST: 'POST',
  COMMENT: 'COMMENT',
  LISTING: 'LISTING',
  SERVICE: 'SERVICE',
};

export const notificationTypes = {
  FOLLOWED_YOU: 'FOLLOWED_YOU',
  SENT_FOLLOW_REQUEST: 'SENT_FOLLOW_REQUEST',
  DECLINED_FOLLOW_REQUEST: 'DECLINED_FOLLOW_REQUEST',
  ACCEPTED_FOLLOW_REQUEST: 'ACCEPTED_FOLLOW_REQUEST',
  LIKED_POST: 'LIKED_POST',
  LIKED_COMMENT: 'LIKED_COMMENT',
  // POST_CREATED: 'POST_CREATED',
  // TAGGED_IN_POST: 'TAGGED_IN_POST',
  // COMMENTED_ON_POST: 'COMMENTED_ON_POST',
  // TAGGED_IN_COMMENT: 'TAGGED_IN_COMMENT',
  // REPLIED_TO_COMMENT: 'REPLIED_TO_COMMENT',
  // FOLLOWED_USER: 'FOLLOWED_USER',
  // SENT_FOLLOW_REQUEST: 'SENT_FOLLOW_REQUEST',
  // ACCEPTED_FOLLOW_REQUEST: 'ACCEPTED_FOLLOW_REQUEST',
  // DECLINED_FOLLOW_REQUEST: 'DECLINED_FOLLOW_REQUEST',
  // SYSTEM_NOTIFICATION: 'SYSTEM_NOTIFICATION',
};

export type NotificationType = keyof typeof notificationTypes;

export const notificationMessages = {
  [notificationTypes.FOLLOWED_YOU]: (username: string) => `@${username} starting following you`,
  [notificationTypes.SENT_FOLLOW_REQUEST]: (username: string) => `@${username} requested to follow you`,
  [notificationTypes.DECLINED_FOLLOW_REQUEST]: (username: string) => `@${username} declined your follow request`,
  [notificationTypes.ACCEPTED_FOLLOW_REQUEST]: (username: string) => `@${username} accepted your follow request`,
  // [notificationTypes.POST_CREATED]: (user: string) => `@${user} created a new post`,
  // [notificationTypes.LIKED_POST]: (user: string) => `@${user} liked your post`,
  // [notificationTypes.LIKED_COMMENT]: (user: string) => `@${user} liked your comment`,
  // [notificationTypes.TAGGED_IN_POST]: (user: string) => `@${user} mentioned you in a post`,
  // [notificationTypes.COMMENTED_ON_POST]: (user: string) => `@${user} commented on your post`,
  // [notificationTypes.TAGGED_IN_COMMENT]: (user: string) => `@${user} mentioned you in a comment`,
  // [notificationTypes.REPLIED_TO_COMMENT]: (user: string) => `@${user} replied to your comment`,
  // [notificationTypes.FOLLOWED_USER]: (user: string) => `@${user} started following you`,
  // [notificationTypes.SENT_FOLLOW_REQUEST]: (user: string) => `@${user} requested to follow you`,
  // [notificationTypes.ACCEPTED_FOLLOW_REQUEST]: (user: string) => `@${user} accepted your follow request`,
  // [notificationTypes.DECLINED_FOLLOW_REQUEST]: (user: string) => `@${user} declined your follow request`,
  // [notificationTypes.SYSTEM_NOTIFICATION]: (message: string) => `${message}`,
};

export const ONE_HOUR = 60 * 60 * 1000;
export const ONE_DAY = ONE_HOUR * 24;

export const isOverDaysOld = (date: string, days: number) => {
  if (!date) return false;
  if (Date.parse(date.toString()) >= Date.now()) return false;
  if (Date.parse(date.toString())) {
    const dateDiff = new Date(Date.now() - Date.parse(date));
    const dateDiffInDays = Math.abs(dateDiff.getUTCDate() - 1);
    return dateDiffInDays >= days;
  }
  return false;
};

export const isOverHoursOld = (date: string, hours: number) => {
  if (!date) return false;
  const hoursAgo = Date.now() - (hours * ONE_HOUR);
  if (Date.parse(date)) {
    return Date.parse(date) < hoursAgo;
  }
  return false;
};
