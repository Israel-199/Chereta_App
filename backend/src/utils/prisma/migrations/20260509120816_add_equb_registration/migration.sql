-- CreateTable
CREATE TABLE "EqubRegistration" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "monthlyIncome" TEXT NOT NULL,
    "type" "EqubType" NOT NULL DEFAULT 'VEHICLE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EqubRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EqubRegistration_userId_type_key" ON "EqubRegistration"("userId", "type");

-- AddForeignKey
ALTER TABLE "EqubRegistration" ADD CONSTRAINT "EqubRegistration_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
