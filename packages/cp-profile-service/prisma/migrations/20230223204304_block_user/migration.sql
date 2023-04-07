/*
  Warnings:

  - The primary key for the `FollowRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `requestId` on the `FollowRequest` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "FollowRequest" DROP CONSTRAINT "FollowRequest_pkey",
DROP COLUMN "requestId",
ADD CONSTRAINT "FollowRequest_pkey" PRIMARY KEY ("requestedById", "receiverId");

-- CreateTable
CREATE TABLE "Blocked" (
    "blockedId" TEXT NOT NULL,
    "blockedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Blocked_pkey" PRIMARY KEY ("blockedById","blockedId")
);

-- AddForeignKey
ALTER TABLE "Blocked" ADD CONSTRAINT "Blocked_blockedById_fkey" FOREIGN KEY ("blockedById") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
