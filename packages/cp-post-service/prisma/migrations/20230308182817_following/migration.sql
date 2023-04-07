-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blocked" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "blockedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "followers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "following" TEXT[] DEFAULT ARRAY[]::TEXT[];
