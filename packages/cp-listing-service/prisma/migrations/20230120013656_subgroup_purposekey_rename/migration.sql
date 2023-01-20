/*
  Warnings:

  - You are about to drop the column `listingPurposeKey` on the `PurposeSubgroup` table. All the data in the column will be lost.
  - Added the required column `listingPurpose` to the `PurposeSubgroup` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "PurposeSubgroup" DROP CONSTRAINT "PurposeSubgroup_listingPurposeKey_fkey";

-- AlterTable
ALTER TABLE "PurposeSubgroup" DROP COLUMN "listingPurposeKey",
ADD COLUMN     "listingPurpose" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PurposeSubgroup" ADD CONSTRAINT "PurposeSubgroup_listingPurpose_fkey" FOREIGN KEY ("listingPurpose") REFERENCES "ListingPurpose"("listingPurpose") ON DELETE RESTRICT ON UPDATE CASCADE;
