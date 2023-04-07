import { Request, Response } from 'express';
import { isValidDate, ServiceResponse } from '@cribplug/common';
import NotificationDBService from '../services/notification.service';

const ns = new NotificationDBService();

export const getUserPreviousNotificationsHandler = async (req: Request, res: Response) => {
  const { user } = req;
  let limit: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  const { from } = req.query;
  let fromDate;
  if (!from || !isValidDate(from as string)) {
    fromDate = new Date().toISOString();
  } else {
    fromDate = new Date(from as string).toISOString();
  }
  const sr = await ns.getUserPreviousNotifications(user.userId, fromDate, limit);
  return res.status(sr.statusCode).send(sr);
};

export const getUserNextNotificationsHandler = async (req: Request, res: Response) => {
  const { user } = req;
  let limit: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 12;
  }
  const { from } = req.query;
  let fromDate;
  if (!from || !isValidDate(from as string)) {
    fromDate = new Date().toISOString();
  } else {
    fromDate = new Date(from as string).toISOString();
  }
  const sr = await ns.getUserNextNotifications(user.userId, fromDate, limit);
  return res.status(sr.statusCode).send(sr);
};
