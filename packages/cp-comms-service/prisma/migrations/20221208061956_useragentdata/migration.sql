-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "userAgentData" JSON DEFAULT '{}';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" TEXT[] DEFAULT ARRAY['USER']::TEXT[];
