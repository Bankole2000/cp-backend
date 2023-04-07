import { Channel, ServiceEvent } from '@cribplug/common';
import { profileJobs } from '../handlers/index.handlers.service';

export const profileQueueJobsHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await profileJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    case 'USER_FOLLOWED_USER': {
      console.log('Reached here');
      const result = await profileJobs.USER_FOLLOWED_USER(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    case 'USER_UNFOLLOWED_USER': {
      const result = await profileJobs.USER_UNFOLLOWED_USER(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    case 'USER_SENT_FOLLOW_REQUEST': {
      const result = await profileJobs.USER_SENT_FOLLOW_REQUEST(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    case 'USER_BLOCKED_USER': {
      const result = await profileJobs.USER_BLOCKED_USER(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    case 'USER_UNBLOCKED_USER': {
      const result = await profileJobs.USER_UNBLOCKED_USER(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    default: {
      const result = await profileJobs.profileDefaultJobHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
