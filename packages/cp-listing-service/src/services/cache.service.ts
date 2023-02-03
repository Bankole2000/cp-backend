import { RedisConnection, ServiceResponse } from '@cribplug/common';
import { config } from '../utils/config';

const { serviceName } = config.self;
const { scope } = config.redisConfig;

const getCacheKey = (key: string) => `${scope}:${serviceName}:cache:${key}`;

export const getCache = async (redis: RedisConnection, key: string) => {
  try {
    await redis.client.connect();
  } catch (error: any) {
    console.log({ error });
  }
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
  ttlSeconds = 60
) => {
  try {
    await redis.client.connect();
    await redis.client.setEx(getCacheKey(key), ttlSeconds, JSON.stringify(value));
    await redis.client.disconnect();
  } catch (error: any) {
    console.log({ error });
  }
};

export const deleteCache = async (redis: RedisConnection, keys: string[]) => {
  const formattedKeys = keys.map(getCacheKey);
  console.log({ formattedKeys });
  await redis.client.connect();
  await redis.client.del(formattedKeys);
  await redis.client.disconnect();
};

export const getOrSetCache = async (
  redis: RedisConnection,
  key: string,
  callback: any,
  ttlSeconds = 60,
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
