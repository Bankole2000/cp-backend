import { Channel, ServiceEvent } from '@cribplug/common';
import { notificationJobs } from '../handlers/index.handlers';

export const notificationExchangeHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await notificationJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    default: {
      const result = await notificationJobs.notificationDefaultExchangeHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
