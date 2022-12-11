import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ServiceResponse } from '@cribplug/common';
import { config } from '../utils/config';
import { logResponse } from '../middleware/logRequests';

const prisma = new PrismaClient();

type Model = keyof Omit<PrismaClient, 'disconnect' | 'connect' | 'executeRaw' | 'queryRaw' | 'transaction' | 'on'>;

export const getServiceDataSchema = async (req: Request, res: Response) => {
  const models = Object.keys(prisma).filter((x) => x.charAt(0) !== '_');
  const sr = new ServiceResponse(`${config.self.serviceName} Service Data Schema`, { models }, true, 200, null, null, null);
  await logResponse(req, sr);
  res.status(sr.statusCode).send(sr);
};

export const getModelData = async (req: Request, res: Response) => {
  const { model } = req.params;
  if (!prisma[model as Model]) {
    const sr = new ServiceResponse('Model not found', null, false, 404, 'Model not found', null);
    await logResponse(req, sr);
    return res.status(sr.statusCode).send(sr);
  }
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const data = await prisma[model as Model].findMany({
    orderBy: {
      createdAt: 'desc',
    }
  });
  const sr = new ServiceResponse('Service Data', data, true, 200, null, null, null);
  await logResponse(req, sr);
  return res.status(sr.statusCode).send(sr);
};
