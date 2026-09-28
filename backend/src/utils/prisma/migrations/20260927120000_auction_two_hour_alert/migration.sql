ALTER TABLE "AuctionItem" ADD COLUMN IF NOT EXISTS "twoHourAlertSent" BOOLEAN NOT NULL DEFAULT false;

UPDATE "AuctionItem" SET "minBid" = 1 WHERE "minBid" < 1 OR "minBid" = 1.01;
UPDATE "AuctionItem" SET "bidStep" = 1 WHERE "bidStep" = 0.01;
