-- CreateEnum
CREATE TYPE "AdvanceSide" AS ENUM ('HOME', 'AWAY');

-- AlterTable
ALTER TABLE "Prediction" ADD COLUMN     "advancementPoints" INTEGER,
ADD COLUMN     "advancesTeam" "AdvanceSide";

