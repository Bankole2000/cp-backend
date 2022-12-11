-- AlterTable
ALTER TABLE "RequestLog" ADD COLUMN     "userAgentData" JSON DEFAULT '{}';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY['USER']::TEXT[];

-- CreateTable
CREATE TABLE "Listing" (
    "listingId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "shortDescription" VARCHAR(255),
    "longDescription" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Listing_pkey" PRIMARY KEY ("listingId")
);
