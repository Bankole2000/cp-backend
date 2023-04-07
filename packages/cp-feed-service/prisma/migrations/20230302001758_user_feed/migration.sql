/*
  Warnings:

  - You are about to drop the `Feed` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Feed" DROP CONSTRAINT "Feed_userId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "blocked" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "blockedBy" TEXT[] DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "followers" SET DEFAULT ARRAY[]::TEXT[],
ALTER COLUMN "following" SET DEFAULT ARRAY[]::TEXT[];

-- DropTable
DROP TABLE "Feed";

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "caption" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "allowComments" BOOLEAN NOT NULL DEFAULT true,
    "showLikesCount" BOOLEAN NOT NULL DEFAULT true,
    "createdBy" TEXT,
    "urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "postMedia" JSONB,
    "tags" JSONB,
    "moderation" JSONB,
    "createdByData" JSONB,
    "comments" JSONB,
    "views" JSONB,
    "likedBy" JSONB,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFeed" (
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserFeed_pkey" PRIMARY KEY ("userId","postId","createdAt")
);

-- AddForeignKey
ALTER TABLE "UserFeed" ADD CONSTRAINT "UserFeed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFeed" ADD CONSTRAINT "UserFeed_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
