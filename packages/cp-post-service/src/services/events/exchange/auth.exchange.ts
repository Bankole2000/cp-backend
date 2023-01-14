import { Channel, ServiceEvent } from '@cribplug/common';
import { authJobs } from '../handlers/index.handlers';

export const authExchangeHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await authJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    default: {
      const result = await authJobs.authDefaultExchangeHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
