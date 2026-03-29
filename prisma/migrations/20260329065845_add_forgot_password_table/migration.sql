/*
  Warnings:

  - Added the optional column `forgotPasswordId` to the `User` table.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "forgotPasswordId" TEXT;

-- CreateTable
CREATE TABLE "ForgotPassword" (
    "id" TEXT NOT NULL,

    CONSTRAINT "ForgotPassword_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_forgotPasswordId_fkey" FOREIGN KEY ("forgotPasswordId") REFERENCES "ForgotPassword"("id") ON DELETE SET NULL ON UPDATE CASCADE;
