import { Channel, ServiceEvent } from '@cribplug/common';
import { postJobs } from '../handlers/index.handlers.service';

export const postQueueJobsHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    case 'POST_PUBLISHED': {
      const result = await postJobs.POST_PUBLISHED(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
    default:
      break;
  }
};
