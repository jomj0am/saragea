/*
  Warnings:

  - A unique constraint covering the columns `[transactionRef]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."Invoice" ADD COLUMN     "transactionRef" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_transactionRef_key" ON "public"."Invoice"("transactionRef");
