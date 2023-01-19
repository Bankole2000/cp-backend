-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_listingPurposeSubgroup_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_listingPurpose_fkey";

-- DropForeignKey
ALTER TABLE "Listing" DROP CONSTRAINT "Listing_listingType_fkey";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "listingPurpose" DROP NOT NULL,
ALTER COLUMN "listingType" DROP NOT NULL,
ALTER COLUMN "listingPurposeSubgroup" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingType_fkey" FOREIGN KEY ("listingType") REFERENCES "ListingType"("listingType") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingPurpose_fkey" FOREIGN KEY ("listingPurpose") REFERENCES "ListingPurpose"("listingPurpose") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Listing" ADD CONSTRAINT "Listing_listingPurposeSubgroup_fkey" FOREIGN KEY ("listingPurposeSubgroup") REFERENCES "PurposeSubgroup"("purposeSubgroup") ON DELETE SET NULL ON UPDATE CASCADE;
