-- CreateTable
CREATE TABLE "ipGeoData" (
    "ip" TEXT NOT NULL,
    "geoData" JSON NOT NULL DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "ipGeoData_ip_key" ON "ipGeoData"("ip");
