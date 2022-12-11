import { Channel, ServiceEvent } from '@cribplug/common';
import {
  authQueueJobsHandler,
  chatQueueJobsHandler,
  commsQueueJobsHandler,
  feedQueueJobsHandler,
  listingQueueJobsHandler,
  notificationQueueJobsHandler,
  offerQueueJobsHandler,
  profileQueueJobsHandler,
  transactionQueueJobsHandler,
  unknownServiceQueueJobsHandler
} from './jobs/index.jobs.service';

export const queueEventHandlers = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.origin) {
    case 'auth-service':
      await authQueueJobsHandler(msg, channel);
      break;
    case 'chat-service':
      await chatQueueJobsHandler(msg, channel);
      break;
    case 'comms-service':
      await commsQueueJobsHandler(msg, channel);
      break;
    case 'feed-service':
      await feedQueueJobsHandler(msg, channel);
      break;
    case 'listing-service':
      await listingQueueJobsHandler(msg, channel);
      break;
    case 'notification-service':
      await notificationQueueJobsHandler(msg, channel);
      break;
    case 'offer-service':
      await offerQueueJobsHandler(msg, channel);
      break;
    case 'profile-service':
      await profileQueueJobsHandler(msg, channel);
      break;
    case 'transaction-service':
      await transactionQueueJobsHandler(msg, channel);
      break;
    default:
      await unknownServiceQueueJobsHandler(msg, channel);
      break;
  }
};
