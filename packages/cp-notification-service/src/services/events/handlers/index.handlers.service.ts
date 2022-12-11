import { authDefaultExchangeHandler, authDefaultJobHandler } from './auth.handlers';
import { chatDefaultExchangeHandler, chatDefaultJobHandler } from './chat.handlers';
import { commsDefaultExchangeHandler, commsDefaultJobHandler } from './comms.handlers';
import { feedDefaultExchangeHandler, feedDefaultJobHandler } from './feed.handlers';
import { listingDefaultExchangeHandler, listingDefaultJobHandler } from './listing.handlers';
import { notificationDefaultExchangeHandler, notificationDefaultJobHandler } from './notification.handlers';
import { offerDefaultExchangeHandler, offerDefaultJobHandler } from './offer.handlers';
import { profileDefaultExchangeHandler, profileDefaultJobHandler } from './profile.handlers';
import { transactionDefaultExchangeHandler, transactionDefaultJobHandler } from './transaction.handlers';

export const authJobs = {
  authDefaultJobHandler,
  authDefaultExchangeHandler,
};

export const chatJobs = {
  chatDefaultJobHandler,
  chatDefaultExchangeHandler
};

export const commsJobs = {
  commsDefaultJobHandler,
  commsDefaultExchangeHandler
};

export const feedJobs = {
  feedDefaultJobHandler,
  feedDefaultExchangeHandler
};

export const listingJobs = {
  listingDefaultJobHandler,
  listingDefaultExchangeHandler
};

export const notificationJobs = {
  notificationDefaultJobHandler,
  notificationDefaultExchangeHandler
};

export const offerJobs = {
  offerDefaultJobHandler,
  offerDefaultExchangeHandler
};

export const profileJobs = {
  profileDefaultJobHandler,
  profileDefaultExchangeHandler
};

export const transactionJobs = {
  transactionDefaultJobHandler,
  transactionDefaultExchangeHandler
};
