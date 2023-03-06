-- AlterTable
ALTER TABLE "User" ADD COLUMN     "followers" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "following" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notifyOnListing" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notifyOnOffer" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notifyOnPersonalAd" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "notifyOnPost" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateTable
CREATE TABLE "UserNotificationSettings" (
    "userId" TEXT NOT NULL,
    "notifyOnFollow" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnPostComment" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnPostLike" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnPersonalAdComment" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnPersonalAdLike" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnListingLike" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnOfferComment" BOOLEAN NOT NULL DEFAULT true,
    "notifyOnOfferLike" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "UserNotificationSettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "UserNotificationSettings" ADD CONSTRAINT "UserNotificationSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
