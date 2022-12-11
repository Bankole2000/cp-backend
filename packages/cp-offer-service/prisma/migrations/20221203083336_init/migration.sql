-- CreateTable
CREATE TABLE "User" (
    "userId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "username" TEXT NOT NULL,
    "firstname" VARCHAR(100),
    "lastname" VARCHAR(100),
    "displayname" VARCHAR(100),
    "dob" TIMESTAMP(3) NOT NULL,
    "tos" BOOLEAN NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "ip" TEXT,
    "userAgent" TEXT,
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
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

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
