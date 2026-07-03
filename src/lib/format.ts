import { BetType, MatchStatus } from "@/generated/prisma/client";

export function isBettingOpen(kickoff: Date): boolean {
  return kickoff.getTime() > Date.now();
}

/** Ukrainian noun agreement for "point(s)": 1 очко, 2-4 очки, 0/5-20 очок. */
export function pointsWord(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "очко";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return "очки";
  return "очок";
}

export function formatPoints(n: number): string {
  return `${n} ${pointsWord(n)}`;
}

export function formatKickoff(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "Скоро",
  LIVE: "Триває",
  FINISHED: "Завершено",
  POSTPONED: "Перенесено",
  CANCELLED: "Скасовано",
};

export const BET_TYPE_LABELS: Record<BetType, string> = {
  HOME_WIN: "Перемога господарів",
  AWAY_WIN: "Перемога гостей",
  DRAW: "Нічия",
  EXACT_SCORE: "Точний рахунок",
};

export const BET_TYPE_POINTS: Record<BetType, number> = {
  HOME_WIN: 3,
  AWAY_WIN: 3,
  DRAW: 1,
  EXACT_SCORE: 5,
};
