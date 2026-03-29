/*
  Warnings:

  - You are about to drop the column `userId` on the `Company` table. All the data in the column will be lost.
  - You are about to drop the column `amount` on the `Receipt` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[adminId]` on the table `Company` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `adminId` to the `Company` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountConverted` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountOriginal` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `conversionRate` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyCompany` to the `Receipt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currencyOriginal` to the `Receipt` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Company" DROP CONSTRAINT "Company_userId_fkey";

-- DropIndex
DROP INDEX "Company_userId_key";

-- DropIndex
DROP INDEX "User_managerId_key";

-- AlterTable
ALTER TABLE "Company" DROP COLUMN "userId",
ADD COLUMN     "adminId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Receipt" DROP COLUMN "amount",
ADD COLUMN     "amountConverted" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "amountOriginal" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "companyId" TEXT,
ADD COLUMN     "conversionRate" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "currencyCompany" TEXT NOT NULL,
ADD COLUMN     "currencyOriginal" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "companyId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Company_adminId_key" ON "Company"("adminId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Company" ADD CONSTRAINT "Company_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
