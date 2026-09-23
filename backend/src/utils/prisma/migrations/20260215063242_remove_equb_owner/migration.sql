/*
  Warnings:

  - The values [PROCESSED,FAILED] on the enum `RefundStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `ownerId` on the `Equb` table. All the data in the column will be lost.
  - The `confirmedByRole` column on the `Payout` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `systemId` on the `User` table. All the data in the column will be lost.
  - The `role` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'MEMBER');

-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'CBE';

-- AlterEnum
BEGIN;
CREATE TYPE "RefundStatus_new" AS ENUM ('REQUESTED', 'APPROVED', 'REJECTED');
ALTER TABLE "Refund" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Refund" ALTER COLUMN "status" TYPE "RefundStatus_new" USING ("status"::text::"RefundStatus_new");
ALTER TYPE "RefundStatus" RENAME TO "RefundStatus_old";
ALTER TYPE "RefundStatus_new" RENAME TO "RefundStatus";
DROP TYPE "RefundStatus_old";
ALTER TABLE "Refund" ALTER COLUMN "status" SET DEFAULT 'REQUESTED';
COMMIT;

-- AlterEnum
ALTER TYPE "UserStatus" ADD VALUE 'INACTIVE';

-- DropForeignKey
ALTER TABLE "Equb" DROP CONSTRAINT "Equb_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "OtpLog" DROP CONSTRAINT "OtpLog_userId_fkey";

-- DropIndex
DROP INDEX "User_systemId_key";

-- AlterTable
ALTER TABLE "Equb" DROP COLUMN "ownerId";

-- AlterTable
ALTER TABLE "OtpLog" ADD COLUMN     "attempts" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Payout" DROP COLUMN "confirmedByRole",
ADD COLUMN     "confirmedByRole" "Role";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
DROP COLUMN "systemId",
ADD COLUMN     "address" TEXT,
ADD COLUMN     "firstName" TEXT,
ADD COLUMN     "gender" TEXT,
ADD COLUMN     "jobType" TEXT,
ADD COLUMN     "lastName" TEXT,
ADD COLUMN     "level" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "photo" TEXT,
DROP COLUMN "role",
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'MEMBER';

-- DropEnum
DROP TYPE "UserRole";

-- CreateIndex
CREATE INDEX "OtpLog_phoneNumber_idx" ON "OtpLog"("phoneNumber");

-- AddForeignKey
ALTER TABLE "OtpLog" ADD CONSTRAINT "OtpLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
