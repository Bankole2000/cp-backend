import { ServiceResponse } from '@cribplug/common';
import { Request, Response } from 'express';
import AdminDBService from '../services/admin.service';

const adminService = new AdminDBService();

export const getAllUserProfilesHandler = async (req: Request, res: Response) => {
  let limit: number;
  let page: number;
  if (parseInt(req.query.limit as string, 10)) {
    limit = parseInt(req.query.limit as string, 10);
  } else {
    limit = 20;
  }
  if (parseInt(req.query.page as string, 10)) {
    page = parseInt(req.query.page as string, 10);
  } else {
    page = 1;
  }
  const sr = await adminService.getAllUserProfiles(page, limit);
  return res.status(sr.statusCode).send(sr);
};
