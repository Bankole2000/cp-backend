/*
  Warnings:

  - You are about to drop the column `accepted` on the `ChatInvites` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ChatInvites" DROP CONSTRAINT "ChatInvites_chatRoomId_fkey";

-- AlterTable
ALTER TABLE "ChatInvites" DROP COLUMN "accepted",
ALTER COLUMN "chatRoomId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "ChatInvites" ADD CONSTRAINT "ChatInvites_chatRoomId_fkey" FOREIGN KEY ("chatRoomId") REFERENCES "ChatRoom"("chatRoomId") ON DELETE SET NULL ON UPDATE CASCADE;
