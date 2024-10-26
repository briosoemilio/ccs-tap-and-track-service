/*
  Warnings:

  - You are about to drop the column `fullName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `studentNumber` on the `User` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "User_studentNumber_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "fullName",
DROP COLUMN "studentNumber";
