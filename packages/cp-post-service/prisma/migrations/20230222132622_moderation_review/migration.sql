-- AlterTable
ALTER TABLE "Comment" ADD COLUMN     "pinned" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ModerationQueue" ADD COLUMN     "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "updated" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "ModerationReview" (
    "id" TEXT NOT NULL,
    "contentId" TEXT NOT NULL,
    "reviewedBy" TEXT,
    "actionTaken" TEXT NOT NULL DEFAULT 'APPROVED',
    "rejected" BOOLEAN NOT NULL DEFAULT false,
    "rejectionReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "comments" TEXT NOT NULL,

    CONSTRAINT "ModerationReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ModerationReview_id_key" ON "ModerationReview"("id");

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ModerationQueue"("postId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("userId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_rejectionReason_fkey" FOREIGN KEY ("rejectionReason") REFERENCES "ReportReason"("reason") ON DELETE SET NULL ON UPDATE CASCADE;
