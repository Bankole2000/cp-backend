/*
  Warnings:

  - You are about to drop the column `description` on the `ListingPurpose` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ListingType` table. All the data in the column will be lost.
  - Added the required column `descriptionHTML` to the `ListingPurpose` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionText` to the `ListingPurpose` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionHTML` to the `ListingType` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionText` to the `ListingType` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ListingPurpose" DROP COLUMN "description",
ADD COLUMN     "descriptionHTML" TEXT NOT NULL,
ADD COLUMN     "descriptionText" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "ListingType" DROP COLUMN "description",
ADD COLUMN     "descriptionHTML" TEXT NOT NULL,
ADD COLUMN     "descriptionText" TEXT NOT NULL;
