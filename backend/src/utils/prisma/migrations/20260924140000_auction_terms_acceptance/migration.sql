-- CreateTable
CREATE TABLE IF NOT EXISTS "AuctionTermsAcceptance" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "auctionItemId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuctionTermsAcceptance_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "AuctionTermsAcceptance_userId_auctionItemId_key" ON "AuctionTermsAcceptance"("userId", "auctionItemId");
CREATE INDEX IF NOT EXISTS "AuctionTermsAcceptance_auctionItemId_idx" ON "AuctionTermsAcceptance"("auctionItemId");

DO $$ BEGIN
  ALTER TABLE "AuctionTermsAcceptance" ADD CONSTRAINT "AuctionTermsAcceptance_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  ALTER TABLE "AuctionTermsAcceptance" ADD CONSTRAINT "AuctionTermsAcceptance_auctionItemId_fkey" FOREIGN KEY ("auctionItemId") REFERENCES "AuctionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
