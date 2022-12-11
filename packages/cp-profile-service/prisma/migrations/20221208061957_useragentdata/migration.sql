-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'NONE');

-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "userAgentData" JSON DEFAULT '{}';

-- CreateTable
CREATE TABLE "Profile" (
    "userId" TEXT NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "username" TEXT,
    "displayname" TEXT,
    "gender" "Gender",
    "bio" TEXT,
    "tos" BOOLEAN DEFAULT false,
    "phone" TEXT,
    "phoneVerified" BOOLEAN DEFAULT false,
    "instagramHandle" VARCHAR(255),
    "twitterHandle" VARCHAR(255),
    "snapchatUrl" VARCHAR(255),
    "facebookUrl" VARCHAR(255),
    "websiteUrl" VARCHAR(255),
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_username_key" ON "Profile"("username");
