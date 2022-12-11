import { Channel, ServiceEvent } from '@cribplug/common';
import { commsJobs } from '../handlers/index.handlers.service';

export const commsQueueJobsHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await commsJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    default: {
      const result = await commsJobs.commsDefaultJobHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
