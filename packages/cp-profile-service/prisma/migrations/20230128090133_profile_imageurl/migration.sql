/*
  Warnings:

  - You are about to drop the column `imageData` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `imageSecureUrl` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `wallpaperData` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `wallpaperSecureUrl` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "imageData",
DROP COLUMN "imageSecureUrl",
DROP COLUMN "wallpaperData",
DROP COLUMN "wallpaperSecureUrl";
