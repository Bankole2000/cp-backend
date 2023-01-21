// import { RedisConnection, ServiceResponse } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import { config } from '../utils/config';

const { serviceName } = config.self;
const { scope } = config.redisConfig;

const getCacheKey = (key: string) => `${scope}:${serviceName}:cache:${key}`;

export const getFromCache = async (req: Request, res: Response, next: NextFunction) => {
  await req.redis.client.connect();
  const cachedValue = await req.redis.client.get(getCacheKey(req.originalUrl));
  if (cachedValue) {
    await req.redis.client.disconnect();
    const sr = JSON.parse(cachedValue);
    return res.status(sr.statusCode).send(sr);
  }
  await req.redis.client.disconnect();
  return next();
};

export const clearFromCache = async (req: Request, res: Response, next: NextFunction) => {
  await req.redis.client.connect();
  await req.redis.client.del(getCacheKey(req.originalUrl));
  await req.redis.client.disconnect();
  return next();
};
