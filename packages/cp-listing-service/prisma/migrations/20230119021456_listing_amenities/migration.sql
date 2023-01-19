/*
  Warnings:

  - The primary key for the `Amenity` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amenityId` on the `Amenity` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[amenity]` on the table `Amenity` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amenity` to the `Amenity` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Amenity" DROP CONSTRAINT "Amenity_pkey",
DROP COLUMN "amenityId",
ADD COLUMN     "amenity" TEXT NOT NULL,
ADD CONSTRAINT "Amenity_pkey" PRIMARY KEY ("amenity");

-- CreateTable
CREATE TABLE "ListingHasAmenities" (
    "listingId" TEXT NOT NULL,
    "amenity" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingHasAmenities_pkey" PRIMARY KEY ("listingId","amenity")
);

-- CreateIndex
CREATE UNIQUE INDEX "Amenity_amenity_key" ON "Amenity"("amenity");

-- AddForeignKey
ALTER TABLE "ListingHasAmenities" ADD CONSTRAINT "ListingHasAmenities_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("listingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingHasAmenities" ADD CONSTRAINT "ListingHasAmenities_amenity_fkey" FOREIGN KEY ("amenity") REFERENCES "Amenity"("amenity") ON DELETE RESTRICT ON UPDATE CASCADE;
