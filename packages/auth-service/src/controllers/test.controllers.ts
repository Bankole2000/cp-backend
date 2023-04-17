import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import { getServiceQueues } from '../services/events.service';
import { config } from '../utils/config';

export const testEndpointHandler = async (req: Request, res: Response) => {
  console.log('Connecting to redis');
  await req.redis.client.connect();
  console.log('Redis connected');
  console.log('Fetching services from redis');
  const services = await req.redis.client.hGetAll(`${config.redisConfig.scope}-services`);
  console.log('Services fetched');
  console.log('Fetching comms service from redis');
  const commsService = await req.redis.client.hGet(`${config.redisConfig.scope}-services`, 'comms-service');
  console.log('Comms service fetched');
  console.log('Fetching auth service from redis');
  const authService = await req.redis.client.hGet(`${config.redisConfig.scope}-services`, config.self.serviceName || '');
  console.log('Auth service fetched');
  console.log('Fetching queues from redis');
  const queues = await req.redis.client.sMembers(`${config.redisConfig.scope}-queues`);
  console.log('Queues fetched');
  console.log('Fetching with no key from redis');
  const missingKey = await req.redis.client.hGetAll(`${config.redisConfig.scope}`);
  console.log('No key fetched');
  console.log('disconnecting redis');
  await req.redis.client.disconnect();
  console.log('redis disconnected');
  console.log('Testing getting all queues');
  const allQueues = await getServiceQueues(req.redis, config.redisConfig.scope, []);
  console.log('all queues fetched');
  console.log('Testing getting some queues');
  const someQueues = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event', 'transaction']);
  console.log('some queues fetched');
  console.log('Testing for error query param fetched');
  if (req.query.query === 'error') {
    console.log('Generating error response');
    const sr = new ServiceResponse('Error', null, false, 500, 'Error', null, null);
    console.log('Saving error response');
    await logResponse(req, sr);
    console.log('Sending error response');
    return res.status(sr.statusCode).send(sr);
  }
  console.log('Generating success response');
  const sr = new ServiceResponse('Success', {
    path: '/test',
    message: '/test route working',
    config,
    queues,
    allQueues,
    someQueues,
    services,
    authService: authService ? JSON.parse(authService) : null,
    serviceList: Object.keys(services),
    missingKey,
    commsService: commsService ? JSON.parse(commsService) : null,
  }, true, 200, null, null, null);
  console.log('Saving success response');
  await logResponse(req, sr);
  console.log('Sending success response');
  return res.status(sr.statusCode).send(sr);
};
