-- CreateTable
CREATE TABLE "ServiceEvents" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSON NOT NULL DEFAULT '{}',
    "origin" TEXT NOT NULL,
    "idToken" TEXT,
    "accessToken" TEXT,
    "serviceQueues" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "userId" TEXT,
    "userData" JSON DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ServiceEvents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ServiceEvents_id_key" ON "ServiceEvents"("id");
