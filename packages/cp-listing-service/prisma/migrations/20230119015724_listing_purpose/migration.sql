/*
  Warnings:

  - You are about to drop the column `amenityCategoryId` on the `Amenity` table. All the data in the column will be lost.
  - The primary key for the `AmenityCategory` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `amenityCategoryId` on the `AmenityCategory` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[amenityCategory]` on the table `AmenityCategory` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `amenityCategory` to the `Amenity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faIcon` to the `Amenity` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mdiIcon` to the `Amenity` table without a default value. This is not possible if the table is not empty.
  - Made the column `description` on table `Amenity` required. This step will fail if there are existing NULL values in that column.
  - Added the required column `amenityCategory` to the `AmenityCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `listingPurposeSubgroup` to the `Listing` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faIcon` to the `ListingPurpose` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mdiIcon` to the `ListingPurpose` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ListingPurpose` table without a default value. This is not possible if the table is not empty.
  - Added the required column `faIcon` to the `ListingType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `mdiIcon` to the `ListingType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ListingType` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Amenity" DROP CONSTRAINT "Amenity_amenityCategoryId_fkey";

-- AlterTable
ALTER TABLE "Amenity" DROP COLUMN "amenityCategoryId",
ADD COLUMN     "amenityCategory" TEXT NOT NULL,
ADD COLUMN     "faIcon" TEXT NOT NULL,
ADD COLUMN     "mdiIcon" TEXT NOT NULL,
ALTER COLUMN "description" SET NOT NULL;

-- AlterTable
ALTER TABLE "AmenityCategory" DROP CONSTRAINT "AmenityCategory_pkey",
DROP COLUMN "amenityCategoryId",
ADD COLUMN     "amenityCategory" TEXT NOT NULL,
ADD CONSTRAINT "AmenityCategory_pkey" PRIMARY KEY ("amenityCategory");

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "listingPurposeSubgroup" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ListingPurpose" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "faIcon" TEXT NOT NULL,
ADD COLUMN     "mdiIcon" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "ListingType" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "faIcon" TEXT NOT NULL,
ADD COLUMN     "mdiIcon" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "PurposeSubgroup" (
    "purposeSubgroup" TEXT NOT NULL,
    "listingPurposeKey" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "faIcon" TEXT NOT NULL,
    "mdiIcon" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurposeSubgroup_pkey" PRIMARY KEY ("purposeSubgroup")
);

-- CreateIndex
CREATE UNIQUE INDEX "PurposeSubgroup_purposeSubgroup_key" ON "PurposeSubgroup"("purposeSubgroup");

-- CreateIndex
CREATE UNIQUE INDEX "AmenityCategory_amenityCategory_key" ON "AmenityCategory"("amenityCategory");

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingPurposeSubgroup_fkey" FOREIGN KEY ("listingPurposeSubgroup") REFERENCES "PurposeSubgroup"("purposeSubgroup") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PurposeSubgroup" ADD CONSTRAINT "PurposeSubgroup_listingPurposeKey_fkey" FOREIGN KEY ("listingPurposeKey") REFERENCES "ListingPurpose"("listingPurpose") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Amenity" ADD CONSTRAINT "Amenity_amenityCategory_fkey" FOREIGN KEY ("amenityCategory") REFERENCES "AmenityCategory"("amenityCategory") ON DELETE RESTRICT ON UPDATE CASCADE;
