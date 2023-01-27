/*
  Warnings:

  - Added the required column `createdByUserId` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "createdByUserId" TEXT NOT NULL,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
