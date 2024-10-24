/*
  Warnings:

  - Added the required column `locationName` to the `Computer` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Computer" ADD COLUMN     "locationName" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Computer" ADD CONSTRAINT "Computer_locationName_fkey" FOREIGN KEY ("locationName") REFERENCES "Location"("name") ON DELETE RESTRICT ON UPDATE CASCADE;
