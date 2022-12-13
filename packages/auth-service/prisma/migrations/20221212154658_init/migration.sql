-- CreateEnum
CREATE TYPE "OnboardingStatus" AS ENUM ('NEWLY_REGISTERED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'ID_VERIFIED', 'AGENT_ID_VERIFIED', 'USERNAME_SET', 'PASSWORD_SET', 'PROFILE_IMAGE_SET', 'COMPLETED');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'SYSTEM', 'SUPPORT', 'AGENT', 'USER');

-- CreateEnum
CREATE TYPE "LoginType" AS ENUM ('EMAIL', 'PHONE', 'USERNAME', 'GOOGLE', 'FACEBOOK');

-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "registeredVia" "LoginType" DEFAULT 'EMAIL',
    "username" TEXT NOT NULL,
    "roles" "Role"[] DEFAULT ARRAY['USER']::"Role"[],
    "password" TEXT NOT NULL,
    "firstname" VARCHAR(100),
    "lastname" VARCHAR(100),
    "displayname" VARCHAR(100),
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL DEFAULT 'OTHER',
    "tos" BOOLEAN NOT NULL,
    "onboardingStatus" "OnboardingStatus"[] DEFAULT ARRAY['NEWLY_REGISTERED']::"OnboardingStatus"[],
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "AccountSettings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "AccountSettings_pkey" PRIMARY KEY ("key","userId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionId" UUID NOT NULL,
    "ip" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "loginType" "LoginType" NOT NULL DEFAULT 'EMAIL',
    "userId" TEXT NOT NULL,
    "deviceId" TEXT,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "loggedOutAt" TIMESTAMP(3),

    CONSTRAINT "Session_pkey" PRIMARY KEY ("sessionId")
);

-- CreateTable
CREATE TABLE "ApprovedDevices" (
    "deviceId" TEXT NOT NULL,
    "ip" TEXT NOT NULL,
    "deviceData" JSON NOT NULL DEFAULT '{}',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ApprovedDevices_pkey" PRIMARY KEY ("deviceId")
);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
    "userAgentData" JSON DEFAULT '{}',
    "method" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "originalUrl" TEXT NOT NULL,
    "params" JSON NOT NULL DEFAULT '{}',
    "body" JSON NOT NULL DEFAULT '{}',
    "query" JSON NOT NULL DEFAULT '{}',
    "response" JSON NOT NULL DEFAULT '{}',
    "user" JSON DEFAULT '{}',
    "success" BOOLEAN NOT NULL DEFAULT false,
    "responseData" JSON DEFAULT '{}',
    "time" INTEGER DEFAULT 0,
    "status" INTEGER,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "ErrorLog" (
    "id" TEXT NOT NULL,
    "requestId" TEXT,
    "error" VARCHAR(1000),
    "errors" JSON DEFAULT '{}',
    "status" INTEGER NOT NULL,
    "fix" VARCHAR(1000),
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "RequestLog_id_key" ON "RequestLog"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorLog_id_key" ON "ErrorLog"("id");

-- CreateIndex
CREATE UNIQUE INDEX "ErrorLog_requestId_key" ON "ErrorLog"("requestId");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "ApprovedDevices"("deviceId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ApprovedDevices" ADD CONSTRAINT "ApprovedDevices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RequestLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
