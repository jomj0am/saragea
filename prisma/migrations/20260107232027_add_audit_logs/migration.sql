/*
  Warnings:

  - Added the required column `resource` to the `AuditLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."AuditLog" ADD COLUMN     "resource" TEXT NOT NULL;
