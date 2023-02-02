-- CreateTable
CREATE TABLE "UserEmailAlias" (
    "email" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserEmailAlias_pkey" PRIMARY KEY ("email")
);

-- AddForeignKey
ALTER TABLE "UserEmailAlias" ADD CONSTRAINT "UserEmailAlias_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
