/* eslint-disable no-param-reassign */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where.deletedAt = null;
    }

    if (params.action === 'findMany') {
      if (params.args.where) {
        if (params.args.where.deletedAt === undefined) {
          params.args.where.deletedAt = null;
        }
      } else {
        params.args.where = { deletedAt: null };
      }
    }
  }
  return next(params);
});

prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    // if (params.action === 'update') {
    //   params.action = 'updateMany';
    //   params.args.where.deletedAt = null;
    // }
    if (params.action === 'updateMany') {
      if (params.args.where !== undefined) {
        params.args.where.deletedAt = null;
      } else {
        params.args.where = { deletedAt: null };
      }
    }
  }
  return next(params);
});

// prisma.$use(async (params, next) => {
//   if (params.model === 'User') {
//     if (params.action === 'delete') {
//       params.action = 'update';
//       params.args.data = { deletedAt: Date.now() };
//     }
//     if (params.action === 'deleteMany') {
//       params.action = 'updateMany';
//       if (params.args.where !== undefined) {
//         params.args.data.deletedAt = Date.now();
//       } else {
//         params.args.data = { deletedAt: Date.now() };
//       }
//     }
//   }
//   return next(params);
// });

export default prisma;
