/*
  Warnings:

  - You are about to drop the `_ComputerOthers` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ComputerOthers" DROP CONSTRAINT "_ComputerOthers_A_fkey";

-- DropForeignKey
ALTER TABLE "_ComputerOthers" DROP CONSTRAINT "_ComputerOthers_B_fkey";

-- AlterTable
ALTER TABLE "Computer" ADD COLUMN     "others" TEXT[];

-- DropTable
DROP TABLE "_ComputerOthers";
