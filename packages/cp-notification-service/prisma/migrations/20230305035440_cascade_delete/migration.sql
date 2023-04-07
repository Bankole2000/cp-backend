-- DropForeignKey
ALTER TABLE "UserNotifications" DROP CONSTRAINT "UserNotifications_notificationId_fkey";

-- DropForeignKey
ALTER TABLE "UserNotifications" DROP CONSTRAINT "UserNotifications_userId_fkey";

-- AddForeignKey
ALTER TABLE "UserNotifications" ADD CONSTRAINT "UserNotifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserNotifications" ADD CONSTRAINT "UserNotifications_notificationId_fkey" FOREIGN KEY ("notificationId") REFERENCES "Notification"("id") ON DELETE CASCADE ON UPDATE CASCADE;
