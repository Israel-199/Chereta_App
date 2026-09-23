/*
  Warnings:

  - You are about to drop the column `approved` on the `EqubMember` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EqubMember" DROP COLUMN "approved";

-- CreateTable
CREATE TABLE "LotteryRound" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "winnerId" TEXT,
    "reward" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LotteryRound_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LotterySpin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roundId" TEXT NOT NULL,
    "spunAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "result" TEXT,

    CONSTRAINT "LotterySpin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LotteryRound_date_key" ON "LotteryRound"("date");

-- CreateIndex
CREATE UNIQUE INDEX "LotterySpin_userId_roundId_key" ON "LotterySpin"("userId", "roundId");

-- AddForeignKey
ALTER TABLE "LotteryRound" ADD CONSTRAINT "LotteryRound_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotterySpin" ADD CONSTRAINT "LotterySpin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LotterySpin" ADD CONSTRAINT "LotterySpin_roundId_fkey" FOREIGN KEY ("roundId") REFERENCES "LotteryRound"("id") ON DELETE CASCADE ON UPDATE CASCADE;
