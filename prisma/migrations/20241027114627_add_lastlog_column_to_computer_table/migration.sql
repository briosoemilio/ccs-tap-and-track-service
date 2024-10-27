/*
  Warnings:

  - A unique constraint covering the columns `[lastLogUUID]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "ComputerLog" DROP CONSTRAINT "ComputerLog_computerId_fkey";

-- AlterTable
ALTER TABLE "Computer" ADD COLUMN     "lastLogUUID" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Computer_lastLogUUID_key" ON "Computer"("lastLogUUID");

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_lastLogUUID_fkey" FOREIGN KEY ("lastLogUUID") REFERENCES "ComputerLog"("uuid") ON DELETE SET NULL ON UPDATE CASCADE;
