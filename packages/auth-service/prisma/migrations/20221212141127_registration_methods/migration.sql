/*
  Warnings:

  - A unique constraint covering the columns `[phone]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('EMAIL', 'PHONE', 'USERNAME', 'GOOGLE', 'FACEBOOK');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "OnboardingStatus" ADD VALUE 'PHONE_VERIFIED';
ALTER TYPE "OnboardingStatus" ADD VALUE 'ID_VERIFIED';
ALTER TYPE "OnboardingStatus" ADD VALUE 'AGENT_ID_VERIFIED';
ALTER TYPE "OnboardingStatus" ADD VALUE 'PROFILE_IMAGE_SET';

-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';

-- AlterTable
ALTER TABLE "Session" ADD COLUMN     "loginType" "LoginType" NOT NULL DEFAULT 'EMAIL';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registeredVia" "LoginType" DEFAULT 'EMAIL';

-- CreateTable
CREATE TABLE "AccountSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AccountSettings_pkey" PRIMARY KEY ("key","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
