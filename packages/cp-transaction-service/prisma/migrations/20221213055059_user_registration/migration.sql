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
