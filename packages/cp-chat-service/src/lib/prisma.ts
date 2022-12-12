import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// if (process.env.NODE_ENV === 'production') {
//   prisma = new PrismaClient();
// } else {
//   if (!global.prisma) {
//     global.prisma = new PrismaClient();
//   }
//   prisma = global.prisma;
// }

prisma.$use(async (params, next) => {
  const result = await next(params);
  return result;
});

export default prisma;
