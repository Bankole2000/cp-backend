-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "userId" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phoneData" JSON DEFAULT '{}';
