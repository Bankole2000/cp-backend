import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import { getServiceQueues } from '../services/events.service';
import { config } from '../utils/config';

export const testEndpointHandler = async (req: Request, res: Response) => {
  await req.redis.client.connect();
  const services = await req.redis.client.hGetAll(`${config.redisConfig.scope}-services`);
  const commsService = await req.redis.client.hGet(`${config.redisConfig.scope}-services`, 'comms-service');
  const authService = await req.redis.client.hGet(`${config.redisConfig.scope}-services`, config.self.serviceName || '');
  const queues = await req.redis.client.sMembers(`${config.redisConfig.scope}-queues`);
  const missingKey = await req.redis.client.hGetAll(`${config.redisConfig.scope}`);
  await req.redis.client.disconnect();
  const allQueues = await getServiceQueues(req.redis, config.redisConfig.scope, []);
  const someQueues = await getServiceQueues(req.redis, config.redisConfig.scope, ['comms', 'event', 'transaction']);
  if (req.query.query === 'error') {
    const sr = new ServiceResponse('Error', null, false, 500, 'Error', null, null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse('Success', {
    path: '/test',
    message: '/test route working',
    config,
    queues,
    allQueues,
    someQueues,
    services,
    authService: JSON.parse(authService || ''),
    serviceList: Object.keys(services),
    missingKey,
    commsService: JSON.parse(commsService || ''),
  }, true, 200, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
