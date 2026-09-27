-- Convert auctionCode to CHR-XXX text format
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'AuctionItem' AND column_name = 'auctionCode' AND data_type = 'integer'
  ) THEN
    ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "auctionCodeStr" TEXT;
    UPDATE "AuctionItem"
    SET "auctionCodeStr" = 'CHR-' || LPAD("auctionCode"::text, 3, '0')
    WHERE "auctionCodeStr" IS NULL;
    ALTER TABLE "AuctionItem" DROP CONSTRAINT IF EXISTS "AuctionItem_auctionCode_key";
    DROP INDEX IF EXISTS "AuctionItem_auctionCode_key";
    ALTER TABLE "AuctionItem" DROP COLUMN "auctionCode";
    ALTER TABLE "AuctionItem" RENAME COLUMN "auctionCodeStr" TO "auctionCode";
    ALTER TABLE "AuctionItem" ALTER COLUMN "auctionCode" SET NOT NULL;
    CREATE UNIQUE INDEX IF NOT EXISTS "AuctionItem_auctionCode_key" ON "AuctionItem"("auctionCode");
    DROP SEQUENCE IF EXISTS "AuctionItem_auctionCode_seq";
  END IF;
END $$;

UPDATE "AuctionItem"
SET "auctionCode" = 'CHR-' || LPAD(REGEXP_REPLACE("auctionCode", '\D', '', 'g'), 3, '0')
WHERE "auctionCode" IS NOT NULL AND "auctionCode" !~ '^CHR-[0-9]{3}$';
