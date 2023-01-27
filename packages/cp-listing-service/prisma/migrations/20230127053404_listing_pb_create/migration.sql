/*
  Warnings:

  - You are about to drop the column `createdByUserId` on the `Listing` table. All the data in the column will be lost.
  - You are about to drop the column `listingId` on the `ListingImage` table. All the data in the column will be lost.
  - You are about to drop the column `listingPbId` on the `ListingImage` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[listingId]` on the table `Listing` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `createdBy` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listing` to the `ListingImage` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_createdByUserId_fkey";

-- DropForeignKey
ALTER TABLE "ListingImage" DROP CONSTRAINT "ListingImage_listingId_fkey";

-- AlterTable
ALTER TABLE "Listing" DROP COLUMN "createdByUserId",
ADD COLUMN     "createdBy" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ListingImage" DROP COLUMN "listingId",
DROP COLUMN "listingPbId",
ADD COLUMN     "listing" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Listing_listingId_key" ON "Listing"("listingId");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingImage" ADD CONSTRAINT "ListingImage_listing_fkey" FOREIGN KEY ("listing") REFERENCES "Listing"("listingId") ON DELETE RESTRICT ON UPDATE CASCADE;
