/*
  Warnings:

  - You are about to drop the column `code` on the `HouseRule` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `HouseRule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HouseRule" DROP COLUMN "code",
DROP COLUMN "description",
ADD COLUMN     "descriptionHTML" TEXT,
ADD COLUMN     "descriptionText" TEXT;
