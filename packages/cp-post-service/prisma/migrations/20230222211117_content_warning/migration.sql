-- DropForeignKey
ALTER TABLE "ModerationReview" DROP CONSTRAINT "ModerationReview_contentId_fkey";

-- DropForeignKey
ALTER TABLE "ModerationReview" DROP CONSTRAINT "ModerationReview_rejectionReason_fkey";

-- DropForeignKey
ALTER TABLE "ModerationReview" DROP CONSTRAINT "ModerationReview_reviewedBy_fkey";

-- AlterTable
ALTER TABLE "ModerationQueue" ADD COLUMN     "contentWarning" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "ModerationReview" ALTER COLUMN "comments" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_contentId_fkey" FOREIGN KEY ("contentId") REFERENCES "ModerationQueue"("postId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_reviewedBy_fkey" FOREIGN KEY ("reviewedBy") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModerationReview" ADD CONSTRAINT "ModerationReview_rejectionReason_fkey" FOREIGN KEY ("rejectionReason") REFERENCES "ReportReason"("reason") ON DELETE CASCADE ON UPDATE CASCADE;
