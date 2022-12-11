import { Channel, ServiceEvent } from '@cribplug/common';

import {
  authExchangeHandler,
  chatExchangeHandler,
  commsExchangeHandler,
  feedExchangeHandler,
  listingExchangeHandler,
  notificationExchangeHandler,
  offerExchangeHandler,
  profileExchangeHandler,
  transactionExchangeHandler,
  unknownServiceExchangeHandler
} from './exchange/index.exchange';

export const exchangeEventHandlers = async (msg: any, channel: Channel) => {
  const message: ServiceEvent = JSON.parse(msg.content.toString());
  switch (message.origin) {
    case 'auth-service':
      await authExchangeHandler(msg, channel);
      break;
    case 'chat-service':
      await chatExchangeHandler(msg, channel);
      break;
    case 'comms-service':
      await commsExchangeHandler(msg, channel);
      break;
    case 'feed-service':
      await feedExchangeHandler(msg, channel);
      break;
    case 'listing-service':
      await listingExchangeHandler(msg, channel);
      break;
    case 'notification-service':
      await notificationExchangeHandler(msg, channel);
      break;
    case 'offer-service':
      await offerExchangeHandler(msg, channel);
      break;
    case 'profile-service':
      await profileExchangeHandler(msg, channel);
      break;
    case 'transaction-service':
      await transactionExchangeHandler(msg, channel);
      break;
    default:
      await unknownServiceExchangeHandler(msg, channel);
      break;
  }
};
