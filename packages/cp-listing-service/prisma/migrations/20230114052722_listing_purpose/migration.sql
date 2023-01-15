/*
  Warnings:

  - Added the required column `listingPurpose` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingType` to the `Listing` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "listingPurpose" TEXT NOT NULL,
ADD COLUMN     "listingType" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ListingType" (
    "listingType" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ListingType_pkey" PRIMARY KEY ("listingType")
);

-- CreateTable
CREATE TABLE "ListingPurpose" (
    "listingPurpose" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ListingPurpose_pkey" PRIMARY KEY ("listingPurpose")
);

-- CreateIndex
CREATE UNIQUE INDEX "ListingType_listingType_key" ON "ListingType"("listingType");

-- CreateIndex
CREATE UNIQUE INDEX "ListingPurpose_listingPurpose_key" ON "ListingPurpose"("listingPurpose");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingType_fkey" FOREIGN KEY ("listingType") REFERENCES "ListingType"("listingType") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingPurpose_fkey" FOREIGN KEY ("listingPurpose") REFERENCES "ListingPurpose"("listingPurpose") ON DELETE RESTRICT ON UPDATE CASCADE;
