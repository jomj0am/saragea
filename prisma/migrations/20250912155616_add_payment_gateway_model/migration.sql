-- CreateEnum
CREATE TYPE "public"."GatewayProvider" AS ENUM ('SELCOM', 'PESAPAL', 'FLUTTERWAVE', 'PAYCHANGU');

-- CreateTable
CREATE TABLE "public"."PaymentGateway" (
    "id" TEXT NOT NULL,
    "provider" "public"."GatewayProvider" NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL DEFAULT false,
    "apiKey" TEXT,
    "apiSecret" TEXT,
    "vendor" TEXT,
    "isLiveMode" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentGateway_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentGateway_provider_key" ON "public"."PaymentGateway"("provider");
