import { Channel, ServiceEvent } from '@cribplug/common';
import { feedJobs } from '../handlers/index.handlers.service';

export const feedQueueJobsHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await feedJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    default: {
      const result = await feedJobs.feedDefaultJobHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
