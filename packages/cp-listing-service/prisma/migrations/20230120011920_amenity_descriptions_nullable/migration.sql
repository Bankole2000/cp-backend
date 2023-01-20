/*
  Warnings:

  - You are about to drop the column `description` on the `Amenity` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `AmenityCategory` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Amenity" DROP COLUMN "description",
ADD COLUMN     "descriptionHTML" TEXT,
ADD COLUMN     "descriptionText" TEXT;

-- AlterTable
ALTER TABLE "AmenityCategory" DROP COLUMN "description",
ADD COLUMN     "descriptionHTML" VARCHAR(255),
ADD COLUMN     "descriptionText" VARCHAR(255);
