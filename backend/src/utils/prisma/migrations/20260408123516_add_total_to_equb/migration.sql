/*
  Warnings:

  - You are about to drop the column `inviteCode` on the `Equb` table. All the data in the column will be lost.
  - Added the required column `total` to the `Equb` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Equb_inviteCode_key";

-- AlterTable
ALTER TABLE "Attachment" ADD COLUMN     "publicId" TEXT;

-- AlterTable
ALTER TABLE "Equb" DROP COLUMN "inviteCode",
ADD COLUMN     "total" INTEGER NOT NULL;
