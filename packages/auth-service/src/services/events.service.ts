import { Channel, RedisConnection } from '@cribplug/common';
import { config } from '../utils/config';
import { exchangeEventHandlers } from './events/exchangeEventHandlers.service';
import { queueEventHandlers } from './events/queuedEventHandlers.service';

export const serviceEvents = async (channel: Channel) => {
  try {
    await channel.assertExchange(config.rabbitMQConfig.exchange, 'fanout');
    const q = await channel.assertQueue(config.rabbitMQConfig.exqueue, { exclusive: true });
    const j = await channel.assertQueue(config.self.queue, { durable: true });
    await channel.bindQueue(q.queue, config.rabbitMQConfig.exchange, '');
    await channel.consume(q.queue, async (msg: any) => {
      exchangeEventHandlers(msg, channel);
    });
    await channel.consume(j.queue, async (msg: any) => {
      queueEventHandlers(msg, channel);
    }, { noAck: false });
  } catch (error) {
    console.log(error);
  }
};

export const sendToServiceQueues = async (channel: Channel, message: any, services: string[] = []) => {
  const promises: any[] = [];
  services.forEach((service) => {
    promises.push(channel.sendToQueue(service, Buffer.from(JSON.stringify(message)), { persistent: true }));
  });
  const results = await Promise.all(promises);
  console.log(results);
};

export const getServiceQueues = async (redis: RedisConnection, scope = config.redisConfig.scope, services: string[] = []) => {
  await redis.client.connect();
  const registeredQueues = await redis.client.sMembers(`${scope}-queues`);
  let relevantQueues: string[] = [];
  if (!services.length) {
    relevantQueues = registeredQueues.filter((x) => x !== config.self.queue);
  } else {
    relevantQueues = registeredQueues.filter((x) => services.includes(x.split('-')[1]) && x !== config.self.queue);
  }
  await redis.client.disconnect();
  return relevantQueues;
};
