import { prisma } from "@/lib/prisma";
import { BetType } from "@/generated/prisma/client";

const POINTS = {
  WINNER: 3,
  DRAW: 1,
  EXACT_SCORE: 5,
} as const;

function outcomeOf(homeScore: number, awayScore: number): "HOME_WIN" | "AWAY_WIN" | "DRAW" {
  if (homeScore > awayScore) return "HOME_WIN";
  if (awayScore > homeScore) return "AWAY_WIN";
  return "DRAW";
}

export function pointsForPrediction(
  bet: { betType: BetType; homeScore: number | null; awayScore: number | null },
  result: { homeScore: number; awayScore: number },
): number {
  const outcome = outcomeOf(result.homeScore, result.awayScore);

  if (bet.betType === "EXACT_SCORE") {
    const exact = bet.homeScore === result.homeScore && bet.awayScore === result.awayScore;
    return exact ? POINTS.EXACT_SCORE : 0;
  }

  if (bet.betType === "DRAW") {
    return outcome === "DRAW" ? POINTS.DRAW : 0;
  }

  if (bet.betType === "HOME_WIN") {
    return outcome === "HOME_WIN" ? POINTS.WINNER : 0;
  }

  // AWAY_WIN
  return outcome === "AWAY_WIN" ? POINTS.WINNER : 0;
}

/** Scores every prediction for a finished match that hasn't been scored yet. Safe to call repeatedly. */
export async function scoreMatch(matchId: string): Promise<void> {
  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (match.status !== "FINISHED" || match.homeScore === null || match.awayScore === null) {
    return;
  }

  const predictions = await prisma.prediction.findMany({ where: { matchId } });

  await prisma.$transaction(
    predictions.map((prediction) =>
      prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          points: pointsForPrediction(prediction, {
            homeScore: match.homeScore!,
            awayScore: match.awayScore!,
          }),
        },
      }),
    ),
  );
}
