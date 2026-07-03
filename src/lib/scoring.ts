import { prisma } from "@/lib/prisma";
import { BetType, AdvanceSide } from "@/generated/prisma/client";

const POINTS = {
  WINNER: 3,
  DRAW: 1,
  EXACT_SCORE: 5,
} as const;

const ADVANCEMENT_POINTS = 1;

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

/**
 * Who actually advances to the next round, unlike outcomeOf() above this
 * counts a penalty shootout result when there is one — the main bet
 * (betType/points) is always penalty-blind by design, this is the one place
 * penalties matter.
 */
export function advancingSide(match: {
  homeScore: number;
  awayScore: number;
  homePenalties: number | null;
  awayPenalties: number | null;
}): AdvanceSide | null {
  if (match.homePenalties !== null && match.awayPenalties !== null) {
    if (match.homePenalties > match.awayPenalties) return "HOME";
    if (match.awayPenalties > match.homePenalties) return "AWAY";
    return null;
  }

  if (match.homeScore > match.awayScore) return "HOME";
  if (match.awayScore > match.homeScore) return "AWAY";
  return null;
}

/** Scores every prediction for a finished match that hasn't been scored yet. Safe to call repeatedly. */
export async function scoreMatch(matchId: string): Promise<void> {
  const match = await prisma.match.findUniqueOrThrow({ where: { id: matchId } });
  if (match.status !== "FINISHED" || match.homeScore === null || match.awayScore === null) {
    return;
  }

  const predictions = await prisma.prediction.findMany({ where: { matchId } });

  // Advancement bets only make sense once a match must produce a winner
  // (knockout stage); group-stage draws are a normal result, not something
  // to resolve a "who goes through" bet against.
  const advanceSide =
    match.stage !== "GROUP_STAGE"
      ? advancingSide({
          homeScore: match.homeScore,
          awayScore: match.awayScore,
          homePenalties: match.homePenalties,
          awayPenalties: match.awayPenalties,
        })
      : null;

  await prisma.$transaction(
    predictions.map((prediction) =>
      prisma.prediction.update({
        where: { id: prediction.id },
        data: {
          points: pointsForPrediction(prediction, {
            homeScore: match.homeScore!,
            awayScore: match.awayScore!,
          }),
          advancementPoints:
            prediction.advancesTeam && advanceSide
              ? prediction.advancesTeam === advanceSide
                ? ADVANCEMENT_POINTS
                : 0
              : prediction.advancementPoints,
        },
      }),
    ),
  );
}
