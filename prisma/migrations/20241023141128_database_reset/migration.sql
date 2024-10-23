/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Item` table. All the data in the column will be lost.
  - You are about to drop the column `locationId` on the `Item` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[monitorName]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[keyboardName]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[mouseName]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[systemUnitName]` on the table `Computer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Computer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `categoryName` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `locationName` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Location` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_computerId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_locationId_fkey";

-- AlterTable
ALTER TABLE "Category" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Computer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "keyboardName" TEXT,
ADD COLUMN     "monitorName" TEXT,
ADD COLUMN     "mouseName" TEXT,
ADD COLUMN     "systemUnitName" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Item" DROP COLUMN "categoryId",
DROP COLUMN "locationId",
ADD COLUMN     "categoryName" TEXT NOT NULL,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "locationName" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Location" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "_ComputerOthers" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ComputerOthers_AB_unique" ON "_ComputerOthers"("A", "B");

-- CreateIndex
CREATE INDEX "_ComputerOthers_B_index" ON "_ComputerOthers"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Computer_monitorName_key" ON "Computer"("monitorName");

-- CreateIndex
CREATE UNIQUE INDEX "Computer_keyboardName_key" ON "Computer"("keyboardName");

-- CreateIndex
CREATE UNIQUE INDEX "Computer_mouseName_key" ON "Computer"("mouseName");

-- CreateIndex
CREATE UNIQUE INDEX "Computer_systemUnitName_key" ON "Computer"("systemUnitName");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_categoryName_fkey" FOREIGN KEY ("categoryName") REFERENCES "Category"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_locationName_fkey" FOREIGN KEY ("locationName") REFERENCES "Location"("name") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_monitorName_fkey" FOREIGN KEY ("monitorName") REFERENCES "Item"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_keyboardName_fkey" FOREIGN KEY ("keyboardName") REFERENCES "Item"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_mouseName_fkey" FOREIGN KEY ("mouseName") REFERENCES "Item"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_systemUnitName_fkey" FOREIGN KEY ("systemUnitName") REFERENCES "Item"("name") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComputerOthers" ADD CONSTRAINT "_ComputerOthers_A_fkey" FOREIGN KEY ("A") REFERENCES "Computer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ComputerOthers" ADD CONSTRAINT "_ComputerOthers_B_fkey" FOREIGN KEY ("B") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
