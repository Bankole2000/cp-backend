import { ServiceResponse, createRequestLogFields } from '@cribplug/common';
import { Request } from 'express';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';
// import { createRequestLogFields } from '../schema/request.schema';

export default class RequestService {
  prisma: PrismaClient;

  constructor() {
    this.prisma = prisma;
  }

  static async extractRequestData(req: any) {
    const updateData: { [key: string]: any } = {
      ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress || null,
      userAgent: req.headers['user-agent'],
      userAgentData: req.useragent
    };
    createRequestLogFields.forEach((field) => {
      if (req[field]) {
        updateData[field] = req[field];
      }
    });
    return updateData;
  }

  async createErrorLog(errorReponse: ServiceResponse, requestId?: string) {
    const {
      error: message, errors, fix, statusCode
    } = errorReponse;
    try {
      const createdError = await this.prisma.errorLog.create({
        data: {
          requestId,
          error: message || '',
          errors: JSON.parse(JSON.stringify(errors)) || {},
          fix,
          status: statusCode,
        },
      });
      return new ServiceResponse('Error created successfully', createdError, true, 201, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating Error', null, false, 500, error.message, error, null);
    }
  }

  async createRequestLog(requestData: any) {
    try {
      const createdRequest = await this.prisma.requestLog.create({
        data: { ...requestData },
      });
      return new ServiceResponse('Request created successfully', createdRequest, true, 201, null, null, null);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error creating Request', null, false, 500, error.message, error, null);
    }
  }

  async updateRequestLog(req: Request, serviceResponse: ServiceResponse) {
    const { requestLog: { id, createdAt }, user } = req;
    try {
      const updatedRequest = await this.prisma.requestLog.update({
        where: {
          id,
        },
        data: {
          user,
          response: JSON.parse(JSON.stringify(serviceResponse)),
          responseData: serviceResponse.data || undefined,
          success: serviceResponse.success,
          message: serviceResponse.message,
          status: serviceResponse.statusCode,
          time: Date.now() - new Date(createdAt).getTime(),
        },
      });
      if (!serviceResponse.success) {
        const errorLog = await this.createErrorLog(serviceResponse, id);
        return new ServiceResponse('Request logged with errors', updatedRequest, serviceResponse.success, serviceResponse.statusCode, serviceResponse.error, errorLog.data, serviceResponse.fix);
      }
      return new ServiceResponse('Request logged', updatedRequest, serviceResponse.success, serviceResponse.statusCode, serviceResponse.error, serviceResponse.errors, serviceResponse.fix);
    } catch (error: any) {
      console.log({ error });
      return new ServiceResponse('Error updating Request', null, false, 500, error.message, error, null);
    }
  }
}
