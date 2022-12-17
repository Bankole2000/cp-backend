import { Channel, ServiceEvent } from '@cribplug/common';
import { authJobs } from '../handlers/index.handlers.service';

export const authQueueJobsHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await authJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    case 'USER_CREATED': {
      const result = await authJobs.USER_CREATED(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    case 'USER_UPDATED': {
      const result = await authJobs.USER_UPDATED(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    case 'USER_LOGGED_IN': {
      const result = await authJobs.USER_LOGGED_IN(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    case 'USER_PURGED': {
      const result = await authJobs.USER_PURGED(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    default: {
      const result = await authJobs.authDefaultJobHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
