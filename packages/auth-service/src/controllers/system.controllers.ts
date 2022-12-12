import { Request, Response } from 'express';
import { logResponse } from '../middleware/logRequests';
import UserDBService from '../services/user.service';

const userService = new UserDBService();

export const addUserRoleHandler = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { role } = req.body;
  const sr = await userService.setUserRoles(userId, role);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
