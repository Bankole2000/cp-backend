-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "urls" TEXT[] DEFAULT ARRAY[]::TEXT[];
