-- AlterTable
ALTER TABLE "User" ADD COLUMN     "savedPosts" TEXT[] DEFAULT ARRAY[]::TEXT[];
