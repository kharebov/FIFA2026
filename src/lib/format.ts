import { BetType, MatchStatus } from "@/generated/prisma/client";

export function isBettingOpen(kickoff: Date): boolean {
  return kickoff.getTime() > Date.now();
}

export function formatKickoff(date: Date): string {
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export const STATUS_LABELS: Record<MatchStatus, string> = {
  SCHEDULED: "Скоро",
  LIVE: "Идёт",
  FINISHED: "Завершён",
  POSTPONED: "Перенесён",
  CANCELLED: "Отменён",
};

export const BET_TYPE_LABELS: Record<BetType, string> = {
  HOME_WIN: "Победа хозяев",
  AWAY_WIN: "Победа гостей",
  DRAW: "Ничья",
  EXACT_SCORE: "Точный счёт",
};

export const BET_TYPE_POINTS: Record<BetType, number> = {
  HOME_WIN: 3,
  AWAY_WIN: 3,
  DRAW: 1,
  EXACT_SCORE: 5,
};
