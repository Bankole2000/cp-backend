declare namespace Express {
  import { Channel, RedisConnection } from '@cribplug/common';
  // import { Channel } from 'amqplib';
  // import { RedisCustomClient } from '../../utils/redisConnect';

  export interface Request {
    channel?: Channel;
    user?: any;
    redis?: RedisConnection;
    requestLog: any;
    // mqConnection?: Connection;
  }
}
