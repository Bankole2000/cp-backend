-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "phone" TEXT,
    "phoneData" JSON DEFAULT '{}',
    "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
    "registeredVia" TEXT,
    "username" TEXT NOT NULL,
    "gender" TEXT,
    "roles" TEXT[] DEFAULT ARRAY['USER']::TEXT[],
    "firstname" VARCHAR(100),
    "lastname" VARCHAR(100),
    "displayname" VARCHAR(100),
    "dob" TIMESTAMP(3) NOT NULL,
    "tos" BOOLEAN NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
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
    "userId" TEXT,
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
ALTER TABLE "ErrorLog" ADD CONSTRAINT "ErrorLog_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "RequestLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
