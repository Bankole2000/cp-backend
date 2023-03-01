/* eslint-disable import/no-mutable-exports */
import {
  RedisConnection,
  Channel,
} from '@cribplug/common';

let channel: Channel | null;
let redis: RedisConnection;

const setShareAbles = (rabbitMQChannel: Channel, redisConnection: RedisConnection) => {
  channel = rabbitMQChannel;
  redis = redisConnection;
};

const getChannel = (): Channel => channel;
const getRedis = () => redis;

const moderationActions = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  AUTO_APPROVED: 'AUTO_APPROVED'
};

const moderationStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  AUTO_APPROVED: 'AUTO_APPROVED'
};

export {
  setShareAbles,
  getChannel,
  getRedis,
  moderationActions,
  moderationStatus
};
