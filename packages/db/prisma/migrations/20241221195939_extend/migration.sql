/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `Challenge` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Poll` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Challenge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Poll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "code" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Poll" ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "enabled" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE UNIQUE INDEX "Challenge_code_key" ON "Challenge"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Poll_code_key" ON "Poll"("code");
