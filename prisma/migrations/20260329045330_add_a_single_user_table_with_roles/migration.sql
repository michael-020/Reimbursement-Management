/*
  Warnings:

  - You are about to drop the column `approverType` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the `Admin` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Director` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Employee` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `FinanceTeam` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Manager` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `order` to the `Approval` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE', 'MANAGER', 'FINANCE', 'DIRECTOR');

-- DropForeignKey
ALTER TABLE "Employee" DROP CONSTRAINT "Employee_managerId_fkey";

-- DropForeignKey
ALTER TABLE "Receipt" DROP CONSTRAINT "Receipt_createdById_fkey";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "approverType",
ADD COLUMN     "order" INTEGER NOT NULL;

-- DropTable
DROP TABLE "Admin";

-- DropTable
DROP TABLE "Director";

-- DropTable
DROP TABLE "Employee";

-- DropTable
DROP TABLE "FinanceTeam";

-- DropTable
DROP TABLE "Manager";

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "managerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_managerId_key" ON "User"("managerId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Receipt" ADD CONSTRAINT "Receipt_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
