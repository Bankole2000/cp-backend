/*
  Warnings:

  - You are about to alter the column `firstname` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `lastname` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - You are about to alter the column `displayname` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(100)`.
  - The `gender` column on the `Profile` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to alter the column `bio` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(255)`.
  - You are about to alter the column `instagramHandle` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `twitterHandle` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `snapchatUrl` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `facebookUrl` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to alter the column `websiteUrl` on the `Profile` table. The data in that column could be lost. The data in that column will be cast from `VarChar(255)` to `VarChar(100)`.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `dob` to the `Profile` table without a default value. This is not possible if the table is not empty.
  - Made the column `username` on table `Profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `tos` on table `Profile` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phoneVerified` on table `Profile` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "dob" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "email" TEXT,
ADD COLUMN     "emailVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "listingsCount" INTEGER DEFAULT 0,
ADD COLUMN     "offersCount" INTEGER DEFAULT 0,
ADD COLUMN     "postCount" INTEGER DEFAULT 0,
ADD COLUMN     "registeredVia" TEXT,
ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY['USER']::TEXT[],
ALTER COLUMN "firstname" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "lastname" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "username" SET NOT NULL,
ALTER COLUMN "displayname" SET DATA TYPE VARCHAR(100),
DROP COLUMN "gender",
ADD COLUMN     "gender" TEXT,
ALTER COLUMN "bio" SET DATA TYPE VARCHAR(255),
ALTER COLUMN "tos" SET NOT NULL,
ALTER COLUMN "tos" DROP DEFAULT,
ALTER COLUMN "phoneVerified" SET NOT NULL,
ALTER COLUMN "instagramHandle" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "twitterHandle" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "snapchatUrl" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "facebookUrl" SET DATA TYPE VARCHAR(100),
ALTER COLUMN "websiteUrl" SET DATA TYPE VARCHAR(100);

-- DropTable
DROP TABLE "User";

-- DropEnum
DROP TYPE "Gender";

-- CreateTable
CREATE TABLE "Follows" (
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follows_pkey" PRIMARY KEY ("followerId","followingId")
);

-- CreateTable
CREATE TABLE "FollowRequest" (
    "requestId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("requestId")
);

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follows" ADD CONSTRAINT "Follows_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_requestedById_fkey" FOREIGN KEY ("requestedById") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowRequest" ADD CONSTRAINT "FollowRequest_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
