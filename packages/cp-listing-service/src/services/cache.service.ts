import { RedisConnection, ServiceResponse } from '@cribplug/common';
import { config } from '../utils/config';

const { serviceName } = config.self;
const { scope } = config.redisConfig;

const getCacheKey = (key: string) => `${scope}:${serviceName}:cache:${key}`;

export const getCache = async (redis: RedisConnection, key: string) => {
  await redis.client.connect();
  const cachedValue = await redis.client.get(getCacheKey(key));
  if (cachedValue) {
    await redis.client.disconnect();
    return JSON.parse(cachedValue);
  }
  await redis.client.disconnect();
  return null;
};

export const setCache = async (
  redis: RedisConnection,
  key: string,
  value: any,
  ttlSeconds = 3600
) => {
  await redis.client.connect();
  await redis.client.setEx(getCacheKey(key), ttlSeconds, JSON.stringify(value));
  await redis.client.disconnect();
};

export const deleteCache = async (redis: RedisConnection, keys: string[]) => {
  await redis.client.connect();
  keys.forEach(async (key) => {
    await redis.client.del(getCacheKey(key));
  });
  await redis.client.disconnect();
};

export const getOrSetCache = async (
  redis: RedisConnection,
  key: string,
  callback: any,
  ttlSeconds = 3600,
) => {
  await redis.client.connect();
  const cachedValue = await redis.client.get(getCacheKey(key));
  if (JSON.parse(cachedValue as string)) {
    await redis.client.disconnect();
    return new ServiceResponse(
      `${key} retrieved from cache`,
      JSON.parse(cachedValue as string),
      true,
      200,
      null,
      null,
      null,
    );
  }
  const value = await callback();
  console.log({ value });
  await redis.client.setEx(getCacheKey(key), ttlSeconds, JSON.stringify(value.data));
  await redis.client.disconnect();
  return value;
};
