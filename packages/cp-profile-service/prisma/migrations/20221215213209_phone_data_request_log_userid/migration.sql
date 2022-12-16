-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "phoneData" JSON DEFAULT '{}';

-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "userId" TEXT;
