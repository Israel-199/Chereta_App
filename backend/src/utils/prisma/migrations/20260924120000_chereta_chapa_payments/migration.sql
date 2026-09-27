DO $$ BEGIN
  CREATE TYPE "CheretaPaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'CANCELLED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TYPE "PaymentProvider" ADD VALUE 'CHAPA';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "CheretaServicePayment" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "auctionItemId" TEXT NOT NULL,
  "bidAmount" DOUBLE PRECISION NOT NULL,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'ETB',
  "status" "CheretaPaymentStatus" NOT NULL DEFAULT 'PENDING',
  "provider" TEXT NOT NULL DEFAULT 'CHAPA',
  "txRef" TEXT NOT NULL,
  "chapaRef" TEXT,
  "checkoutUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "paidAt" TIMESTAMP(3),
  CONSTRAINT "CheretaServicePayment_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "CheretaServicePayment_txRef_key" ON "CheretaServicePayment"("txRef");
CREATE INDEX IF NOT EXISTS "CheretaServicePayment_userId_auctionItemId_status_idx" ON "CheretaServicePayment"("userId", "auctionItemId", "status");

DO $$ BEGIN
  ALTER TABLE "CheretaServicePayment" ADD CONSTRAINT "CheretaServicePayment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "CheretaServicePayment" ADD CONSTRAINT "CheretaServicePayment_auctionItemId_fkey" FOREIGN KEY ("auctionItemId") REFERENCES "AuctionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "Bid" ADD COLUMN IF NOT EXISTS "servicePaymentId" TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS "Bid_servicePaymentId_key" ON "Bid"("servicePaymentId");

DO $$ BEGIN
  ALTER TABLE "Bid" ADD CONSTRAINT "Bid_servicePaymentId_fkey" FOREIGN KEY ("servicePaymentId") REFERENCES "CheretaServicePayment"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
