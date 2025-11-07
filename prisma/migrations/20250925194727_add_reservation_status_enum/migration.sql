/*
  Warnings:

  - The `status` column on the `Reservation` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "public"."ReservationStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED');

-- AlterTable
ALTER TABLE "public"."Reservation" DROP COLUMN "status",
ADD COLUMN     "status" "public"."ReservationStatus" NOT NULL DEFAULT 'PENDING';
