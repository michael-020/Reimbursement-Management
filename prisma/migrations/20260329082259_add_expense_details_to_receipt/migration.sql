/*
  Warnings:

  - Added the required column `category` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expenseDate` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Receipt" ADD COLUMN     "category" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "expenseDate" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "receiptUrl" TEXT;
