-- Extra Chereta auction columns (valid PostgreSQL, idempotent)

ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "categoryLabel" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "itemNumber" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "serviceFee" DOUBLE PRECISION NOT NULL DEFAULT 75;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "minBid" DOUBLE PRECISION NOT NULL DEFAULT 1.01;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "maxBid" DOUBLE PRECISION NOT NULL DEFAULT 999.99;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "bidStep" DOUBLE PRECISION NOT NULL DEFAULT 0.01;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "viewCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "winnerUserId" TEXT;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "winningAmount" DOUBLE PRECISION;
ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "resolvedAt" TIMESTAMP(3);

-- auctionCode: sequence + backfill (cannot use SERIAL in ADD COLUMN)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'AuctionItem' AND column_name = 'auctionCode'
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS "AuctionItem_auctionCode_seq";
    ALTER TABLE "AuctionItem" ADD COLUMN "auctionCode" INTEGER;
    UPDATE "AuctionItem" SET "auctionCode" = nextval('"AuctionItem_auctionCode_seq"') WHERE "auctionCode" IS NULL;
    ALTER TABLE "AuctionItem" ALTER COLUMN "auctionCode" SET NOT NULL;
    ALTER TABLE "AuctionItem" ALTER COLUMN "auctionCode" SET DEFAULT nextval('"AuctionItem_auctionCode_seq"');
    ALTER SEQUENCE "AuctionItem_auctionCode_seq" OWNED BY "AuctionItem"."auctionCode";
  END IF;
END $$;

CREATE UNIQUE INDEX IF NOT EXISTS "AuctionItem_auctionCode_key" ON "AuctionItem"("auctionCode");
