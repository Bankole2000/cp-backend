/*
  Warnings:

  - You are about to drop the column `userUserId` on the `UserNotifications` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserNotifications" DROP CONSTRAINT "UserNotifications_userUserId_fkey";

-- AlterTable
ALTER TABLE "UserNotifications" DROP COLUMN "userUserId";

-- AddForeignKey
ALTER TABLE "UserNotifications" ADD CONSTRAINT "UserNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
