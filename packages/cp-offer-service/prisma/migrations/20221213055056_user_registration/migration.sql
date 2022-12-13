-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deletedAt" TIMESTAMP(3),
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registeredVia" TEXT,
ADD COLUMN     "roles" TEXT[] DEFAULT ARRAY['USER']::TEXT[],
ALTER COLUMN "email" DROP NOT NULL;

-- CreateTable
CREATE TABLE "RoommateOffer" (
    "roommateOfferId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "aboutMe" TEXT NOT NULL,
    "moveInFrom" TEXT NOT NULL,
    "lengthOfStay" TEXT NOT NULL,
    "interests" TEXT[],
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "location" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoommateOffer_pkey" PRIMARY KEY ("roommateOfferId")
);

-- AddForeignKey
ALTER TABLE "RoommateOffer" ADD CONSTRAINT "RoommateOffer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
