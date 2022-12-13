-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Listing" ADD COLUMN     "basicPrice" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "bookingStayDaysMax" INTEGER,
ADD COLUMN     "bookingStayDaysMin" INTEGER,
ADD COLUMN     "guestArrivalDaysNotice" INTEGER,
ADD COLUMN     "guestBookingMonthsInAdvance" INTEGER,
ADD COLUMN     "guestCapacity" INTEGER,
ADD COLUMN     "latitude" DECIMAL(65,30),
ADD COLUMN     "longitude" DECIMAL(65,30),
ADD COLUMN     "noOfBathrooms" INTEGER,
ADD COLUMN     "noOfBedrooms" INTEGER,
ADD COLUMN     "pricePerMonth" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "pricePerWeek" DECIMAL(10,2) DEFAULT 0.00,
ADD COLUMN     "pricePerWeekend" DECIMAL(10,2) DEFAULT 0.00;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registeredVia" TEXT,
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Amenity" (
    "amenityId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "amenityCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Amenity_pkey" PRIMARY KEY ("amenityId")
);

-- CreateTable
CREATE TABLE "AmenityCategory" (
    "amenityCategoryId" TEXT NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AmenityCategory_pkey" PRIMARY KEY ("amenityCategoryId")
);

-- AddForeignKey
ALTER TABLE "Amenity" ADD CONSTRAINT "Amenity_amenityCategoryId_fkey" FOREIGN KEY ("amenityCategoryId") REFERENCES "AmenityCategory"("amenityCategoryId") ON DELETE RESTRICT ON UPDATE CASCADE;
