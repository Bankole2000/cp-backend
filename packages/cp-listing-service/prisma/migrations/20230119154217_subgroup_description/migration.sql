/*
  Warnings:

  - You are about to drop the column `description` on the `PurposeSubgroup` table. All the data in the column will be lost.
  - Added the required column `descriptionHTML` to the `PurposeSubgroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `descriptionText` to the `PurposeSubgroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PurposeSubgroup" DROP COLUMN "description",
ADD COLUMN     "descriptionHTML" TEXT NOT NULL,
ADD COLUMN     "descriptionText" TEXT NOT NULL;
