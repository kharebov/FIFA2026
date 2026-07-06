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

const KYIV_TZ = "Europe/Kyiv";

function timeZoneOffsetMs(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(date);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  const asUtc = Date.UTC(
    get("year"),
    get("month") - 1,
    get("day"),
    get("hour"),
    get("minute"),
    get("second"),
  );

  return asUtc - date.getTime();
}

/** UTC instants for the start/end of the Kyiv calendar day containing `instant`. */
export function kyivDayBounds(instant: Date): { start: Date; end: Date } {
  const offsetMs = timeZoneOffsetMs(instant, KYIV_TZ);
  const kyivWallClock = new Date(instant.getTime() + offsetMs);
  const wallMidnight = Date.UTC(
    kyivWallClock.getUTCFullYear(),
    kyivWallClock.getUTCMonth(),
    kyivWallClock.getUTCDate(),
  );

  return {
    start: new Date(wallMidnight - offsetMs),
    end: new Date(wallMidnight + 24 * 60 * 60 * 1000 - offsetMs),
  };
}

export function formatKickoff(date: Date): string {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Europe/Kyiv",
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
