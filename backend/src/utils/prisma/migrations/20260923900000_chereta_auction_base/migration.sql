-- Chereta auction models (idempotent for Neon / partial deploys)

DO $$ BEGIN
  CREATE TYPE "AuctionCategory" AS ENUM ('DIGITAL', 'APPLIANCE');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE "AuctionStatus" AS ENUM ('ACTIVE', 'ENDED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "AuctionItem" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" "AuctionCategory" NOT NULL,
  "specs" JSONB,
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "startTime" TIMESTAMP(3) NOT NULL,
  "endTime" TIMESTAMP(3) NOT NULL,
  "status" "AuctionStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuctionItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Bid" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "auctionItemId" TEXT NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Bid_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "Bid_auctionItemId_amount_idx" ON "Bid"("auctionItemId", "amount");

DO $$ BEGIN
  ALTER TABLE "Bid" ADD CONSTRAINT "Bid_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE "Bid" ADD CONSTRAINT "Bid_auctionItemId_fkey" FOREIGN KEY ("auctionItemId") REFERENCES "AuctionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
