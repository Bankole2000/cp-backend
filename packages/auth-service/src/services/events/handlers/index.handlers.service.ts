import { authDefaultExchangeHandler, authDefaultJobHandler } from './auth.handlers';
import { chatDefaultExchangeHandler, chatDefaultJobHandler } from './chat.handlers';
import { commsDefaultExchangeHandler, commsDefaultJobHandler } from './comms.handlers';
import { feedDefaultExchangeHandler, feedDefaultJobHandler } from './feed.handlers';
import { listingDefaultExchangeHandler, listingDefaultJobHandler } from './listing.handlers';
import { notificationDefaultExchangeHandler, notificationDefaultJobHandler } from './notification.handlers';
import { offerDefaultExchangeHandler, offerDefaultJobHandler } from './offer.handlers';
import {
  profileDefaultExchangeHandler,
  profileDefaultJobHandler,
  USER_BLOCKED_USER,
  USER_FOLLOWED_USER,
  USER_SENT_FOLLOW_REQUEST,
  USER_UNBLOCKED_USER,
  USER_UNFOLLOWED_USER
} from './profile.handlers';
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
  profileDefaultExchangeHandler,
  USER_FOLLOWED_USER,
  USER_SENT_FOLLOW_REQUEST,
  USER_UNFOLLOWED_USER,
  USER_BLOCKED_USER,
  USER_UNBLOCKED_USER
};

export const transactionJobs = {
  transactionDefaultJobHandler,
  transactionDefaultExchangeHandler
};
