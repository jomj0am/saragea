/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `Property` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Property" DROP COLUMN "imageUrl",
ADD COLUMN     "images" TEXT[],
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION;
