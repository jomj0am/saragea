-- AlterTable
ALTER TABLE "public"."MaintenanceTicket" ADD COLUMN     "vendorId" TEXT;

-- CreateTable
CREATE TABLE "public"."Vendor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "trade" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,

    CONSTRAINT "Vendor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Vendor_email_key" ON "public"."Vendor"("email");

-- AddForeignKey
ALTER TABLE "public"."MaintenanceTicket" ADD CONSTRAINT "MaintenanceTicket_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
