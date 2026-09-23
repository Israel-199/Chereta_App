/*
  Warnings:

  - You are about to drop the column `frequency` on the `Equb` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "EqubType" AS ENUM ('DAILY', 'WEEKLY', 'MONTHLY', 'HOUSE', 'VEHICLE', 'PHONE');

-- AlterTable
ALTER TABLE "Equb" DROP COLUMN "frequency",
ADD COLUMN     "type" "EqubType" NOT NULL DEFAULT 'DAILY';

-- DropEnum
DROP TYPE "EqubFrequency";
