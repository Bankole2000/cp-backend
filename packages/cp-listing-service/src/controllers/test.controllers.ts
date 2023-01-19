import {
  ServiceResponse, mdiIconsList, faIconsList
} from '@cribplug/common';
import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';

export const testEndpointHandler = async (req: Request, res: Response) => {
  console.log({ query: req.query });
  if (req.query.query === 'error') {
    const sr = new ServiceResponse('Error', null, false, 500, 'Error', null, null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  const sr = new ServiceResponse('Success', {
    path: '/test',
    message: '/test route working',
    mdiIconsList,
    faIconsList
  }, true, 200, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
