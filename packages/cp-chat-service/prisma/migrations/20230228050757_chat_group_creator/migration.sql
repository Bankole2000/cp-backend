-- AlterTable
ALTER TABLE "GroupChatSettings" ADD COLUMN     "createdById" TEXT;

-- AddForeignKey
ALTER TABLE "GroupChatSettings" ADD CONSTRAINT "GroupChatSettings_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;
