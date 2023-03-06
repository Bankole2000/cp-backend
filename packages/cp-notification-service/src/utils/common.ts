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

export {
  setShareAbles,
  getChannel,
  getRedis,
};
