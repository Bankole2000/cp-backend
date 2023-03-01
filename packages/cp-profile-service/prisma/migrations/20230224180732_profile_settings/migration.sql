-- CreateTable
CREATE TABLE "ProfileSettings" (
    "userId" TEXT NOT NULL,
    "allowFollow" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "ProfileSettings_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "ProfileSettings" ADD CONSTRAINT "ProfileSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Profile"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
