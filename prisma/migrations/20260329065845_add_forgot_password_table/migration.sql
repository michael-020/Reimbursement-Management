/*
  Warnings:

  - Added the required column `forgotPasswordId` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "forgotPasswordId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "ForgotPassword" (
    "id" TEXT NOT NULL,

    CONSTRAINT "ForgotPassword_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_forgotPasswordId_fkey" FOREIGN KEY ("forgotPasswordId") REFERENCES "ForgotPassword"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
