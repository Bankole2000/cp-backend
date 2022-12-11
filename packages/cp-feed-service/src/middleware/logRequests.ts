import { getIO, ServiceResponse } from '@cribplug/common';
import { Request, Response, NextFunction } from 'express';
import RequestService from '../services/request.service';

export const logRequest = async (req: Request, _: Response, next: NextFunction) => {
  if (req.originalUrl.includes('/data/')) {
    next();
    return;
  }
  const requestService = new RequestService();
  const requestData = await RequestService.extractRequestData(req);
  const requestLog = await requestService.createRequestLog(requestData);
  if (requestLog.success) {
    req.requestLog = requestLog.data;
  }
  console.log(`${req.method} ${req.path} ${req.requestLog.ip} ${req.requestLog.userAgent}`);
  next();
};

export const logResponse = async (req: Request, response: ServiceResponse) => {
  if (req.originalUrl.includes('/data/')) {
    return;
  }
  const requestService = new RequestService();
  const requestLog = await requestService.updateRequestLog(req, response);
  getIO().emit('REQUEST_LOGGED', requestLog);
};
