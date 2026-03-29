/*
  Warnings:

  - You are about to drop the column `forgotPasswordId` on the `User` table. All the data in the column will be lost.
  - Added the required column `expiresAt` to the `ForgotPassword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `tempPassword` to the `ForgotPassword` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `ForgotPassword` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_forgotPasswordId_fkey";

-- AlterTable
ALTER TABLE "ForgotPassword" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expiresAt" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "isUsed" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "tempPassword" TEXT NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "forgotPasswordId";

-- AddForeignKey
ALTER TABLE "ForgotPassword" ADD CONSTRAINT "ForgotPassword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
