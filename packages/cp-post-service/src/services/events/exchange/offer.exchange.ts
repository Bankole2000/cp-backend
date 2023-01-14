import { Channel, ServiceEvent } from '@cribplug/common';
import { offerJobs } from '../handlers/index.handlers';

export const offerExchangeHandler = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.type) {
    // case 'TEST_EVENT': {
    //   const result = await offerJobs.defaultJobHandler(message);
    //   if (result.success) {
    //     channel.ack(msg);
    //   }
    //   break;
    // }
    default: {
      const result = await offerJobs.offerDefaultExchangeHandler(message);
      if (result.success) {
        channel.ack(msg);
      }
      break;
    }
  }
};
