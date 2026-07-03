Loaded Prisma config from prisma.config.ts.

-- CreateTable
CREATE TABLE "GroupStanding" (
    "id" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "teamName" TEXT NOT NULL,
    "teamCrestUrl" TEXT,
    "playedGames" INTEGER NOT NULL,
    "won" INTEGER NOT NULL,
    "drawn" INTEGER NOT NULL,
    "lost" INTEGER NOT NULL,
    "goalsFor" INTEGER NOT NULL,
    "goalsAgainst" INTEGER NOT NULL,
    "goalDifference" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GroupStanding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupStanding_group_position_idx" ON "GroupStanding"("group", "position");

-- CreateIndex
CREATE UNIQUE INDEX "GroupStanding_group_teamName_key" ON "GroupStanding"("group", "teamName");

