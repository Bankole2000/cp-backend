import { ServiceResponse } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import { logResponse } from './logRequests';

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.log('Something went wrong', err);

  res.status(400).send({
    message: err.message,
  });
};

export const notFoundHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Route Not Found', null, false, 404, 'Not Found', null, null);
  await logResponse(req, sr);
  res.status(sr.statusCode).send(sr);
};

export const notYetImplementedHandler = async (req: Request, res: Response) => {
  const sr = new ServiceResponse('Not yet implemented', null, true, 200, null, null, null);
  res.status(sr.statusCode).send(sr);
};
