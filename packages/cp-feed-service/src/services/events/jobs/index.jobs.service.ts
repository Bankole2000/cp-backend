import { Channel } from '@cribplug/common';

export { authQueueJobsHandler } from './auth.jobs.service';
export { chatQueueJobsHandler } from './chat.jobs.service';
export { commsQueueJobsHandler } from './comms.jobs.service';
export { feedQueueJobsHandler } from './feed.jobs.service';
export { listingQueueJobsHandler } from './listing.jobs.service';
export { notificationQueueJobsHandler } from './notification.jobs.service';
export { offerQueueJobsHandler } from './offer.jobs.service';
export { profileQueueJobsHandler } from './profile.jobs.service';
export { transactionQueueJobsHandler } from './transaction.jobs.service';

export const unknownServiceQueueJobsHandler = async (msg: any, channel: Channel) => {
  console.log({ msg, message: JSON.parse(msg.content.toString()) });
  channel.ack(msg);
};
