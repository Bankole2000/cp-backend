-- CreateTable
CREATE TABLE "ListingHasHouseRule" (
    "listingId" TEXT NOT NULL,
    "houseRule" TEXT NOT NULL,
    "description" TEXT,
    "isAllowed" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListingHasHouseRule_pkey" PRIMARY KEY ("listingId","houseRule")
);

-- CreateTable
CREATE TABLE "HouseRule" (
    "houseRule" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "faIconTrue" TEXT NOT NULL,
    "faIconFalse" TEXT NOT NULL,
    "mdiIconTrue" TEXT NOT NULL,
    "mdiIconFalse" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HouseRule_pkey" PRIMARY KEY ("houseRule")
);

-- CreateIndex
CREATE UNIQUE INDEX "HouseRule_houseRule_key" ON "HouseRule"("houseRule");

-- AddForeignKey
ALTER TABLE "ListingHasHouseRule" ADD CONSTRAINT "ListingHasHouseRule_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "Listing"("listingId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListingHasHouseRule" ADD CONSTRAINT "ListingHasHouseRule_houseRule_fkey" FOREIGN KEY ("houseRule") REFERENCES "HouseRule"("houseRule") ON DELETE RESTRICT ON UPDATE CASCADE;
