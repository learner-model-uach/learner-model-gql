-- AlterTable
ALTER TABLE "Action" ADD COLUMN     "challengeId" INTEGER,
ADD COLUMN     "pollId" INTEGER;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_pollId_fkey" FOREIGN KEY ("pollId") REFERENCES "Poll"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Action" ADD CONSTRAINT "Action_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE SET NULL ON UPDATE CASCADE;
