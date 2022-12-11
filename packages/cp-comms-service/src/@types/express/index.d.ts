declare namespace Express {
  import { Channel, RedisCustomClient } from '@cribplug/common';
  // import { Channel } from 'amqplib';
  // import { RedisCustomClient } from '../../utils/redisConnect';

  export interface Request {
    channel?: Channel;
    user?: any;
    redis?: RedisCustomClient;
    requestLog: any;
    // mqConnection?: Connection;
  }
}
