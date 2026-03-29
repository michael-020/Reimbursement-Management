-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_forgotPasswordId_fkey";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "forgotPasswordId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_forgotPasswordId_fkey" FOREIGN KEY ("forgotPasswordId") REFERENCES "ForgotPassword"("id") ON DELETE SET NULL ON UPDATE CASCADE;
