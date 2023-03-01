import { Driver, getDriver, ServiceResponse } from '@cribplug/common';
import { PrismaClient } from '@prisma/client';
import prisma from '../lib/prisma';

export default class CommentDBService {
  prisma: PrismaClient;

  driver: Driver;

  constructor() {
    this.prisma = prisma;
    this.driver = getDriver();
  }
}
