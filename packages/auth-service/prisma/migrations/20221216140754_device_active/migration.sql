-- AlterTable
ALTER TABLE "ApprovedDevices" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "banned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "bannedByUserId" TEXT;
