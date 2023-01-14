-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "imageData" JSON DEFAULT '{}',
ADD COLUMN     "imageSecureUrl" TEXT,
ADD COLUMN     "imageUrl" TEXT,
ADD COLUMN     "serviceCount" INTEGER DEFAULT 0,
ADD COLUMN     "wallpaperData" JSON DEFAULT '{}',
ADD COLUMN     "wallpaperSecureUrl" TEXT,
ADD COLUMN     "wallpaperUrl" TEXT;
