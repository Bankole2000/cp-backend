import { Channel } from '@cribplug/common';

export { authExchangeHandler } from './auth.exchange';
export { chatExchangeHandler } from './chat.exchange';
export { commsExchangeHandler } from './comms.exchange';
export { feedExchangeHandler } from './feed.exchange';
export { listingExchangeHandler } from './listing.exchange';
export { notificationExchangeHandler } from './notification.exchange';
export { offerExchangeHandler } from './offer.exchange';
export { profileExchangeHandler } from './profile.exchange';
export { transactionExchangeHandler } from './transaction.exchange';

export const unknownServiceExchangeHandler = async (msg: any, channel: Channel) => {
  console.log({ msg, message: JSON.parse(msg.content.toString()) });
  channel.ack(msg);
};
