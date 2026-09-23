-- CreateTable
CREATE TABLE "AppConfig" (
    "id" TEXT NOT NULL,
    "appLive" BOOLEAN NOT NULL DEFAULT false,
    "launchDate" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AppConfig_pkey" PRIMARY KEY ("id")
);
