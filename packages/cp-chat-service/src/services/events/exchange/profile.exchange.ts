import { Channel, ServiceEvent } from '@cribplug/common';
import { profileJobs } from '../handlers/index.handlers.service';

export const profileExchangeHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await profileJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    default: {
      const result = await profileJobs.profileDefaultExchangeHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
