-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "repostId" TEXT;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_repostId_fkey" FOREIGN KEY ("repostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
