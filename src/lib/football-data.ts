import { MatchStatus } from "@/generated/prisma/client";

const BASE_URL = "https://api.football-data.org/v4";
// FIFA World Cup competition code on football-data.org. Covers WC 2026 once
// the tournament's fixtures are published by the provider.
const WORLD_CUP_COMPETITION_CODE = "WC";

interface FootballDataTeam {
  // Null for knockout-stage fixtures whose participants aren't decided yet
  // (e.g. "winner of Round of 16 match 73").
  name: string | null;
  crest: string | null;
}

interface FootballDataMatch {
  id: number;
  utcDate: string;
  status: string;
  stage: string;
  group: string | null;
  matchday: number | null;
  homeTeam: FootballDataTeam;
  awayTeam: FootballDataTeam;
  score: {
    duration: string;
    fullTime: {
      home: number | null;
      away: number | null;
    };
    regularTime?: {
      home: number | null;
      away: number | null;
    };
    penalties?: {
      home: number | null;
      away: number | null;
    };
  };
}

interface FootballDataMatchesResponse {
  matches: FootballDataMatch[];
}

const STATUS_MAP: Record<string, MatchStatus> = {
  SCHEDULED: "SCHEDULED",
  TIMED: "SCHEDULED",
  IN_PLAY: "LIVE",
  PAUSED: "LIVE",
  FINISHED: "FINISHED",
  POSTPONED: "POSTPONED",
  SUSPENDED: "POSTPONED",
  CANCELLED: "CANCELLED",
  AWARDED: "FINISHED",
};

export interface NormalizedMatch {
  externalId: number;
  kickoff: Date;
  status: MatchStatus;
  stage: string;
  group: string | null;
  matchday: number | null;
  homeTeam: string;
  awayTeam: string;
  homeTeamCrestUrl: string | null;
  awayTeamCrestUrl: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties: number | null;
  awayPenalties: number | null;
}

async function footballDataFetch(path: string): Promise<unknown> {
  const apiKey = process.env.FOOTBALL_DATA_API_KEY;
  if (!apiKey) {
    throw new Error("FOOTBALL_DATA_API_KEY is not set");
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    headers: { "X-Auth-Token": apiKey },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`football-data.org request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// football-data.org's `fullTime` score is the sum of regulation + penalties
// for shootout matches (e.g. regularTime 1:1 + penalties 3:4 = fullTime 4:5),
// which isn't a real scoreline. Pull the actual match score and penalty
// score apart so they can be shown (and bet on) separately.
function normalizeScore(score: FootballDataMatch["score"]) {
  if (score.duration === "PENALTY_SHOOTOUT" && score.regularTime) {
    return {
      homeScore: score.regularTime.home,
      awayScore: score.regularTime.away,
      homePenalties: score.penalties?.home ?? null,
      awayPenalties: score.penalties?.away ?? null,
    };
  }
  return {
    homeScore: score.fullTime.home,
    awayScore: score.fullTime.away,
    homePenalties: null,
    awayPenalties: null,
  };
}

export async function fetchWorldCupMatches(): Promise<NormalizedMatch[]> {
  const data = (await footballDataFetch(
    `/competitions/${WORLD_CUP_COMPETITION_CODE}/matches`,
  )) as FootballDataMatchesResponse;

  return data.matches.map((match) => ({
    externalId: match.id,
    kickoff: new Date(match.utcDate),
    status: STATUS_MAP[match.status] ?? "SCHEDULED",
    stage: match.stage,
    group: match.group,
    matchday: match.matchday,
    homeTeam: match.homeTeam.name ?? "TBD",
    awayTeam: match.awayTeam.name ?? "TBD",
    homeTeamCrestUrl: match.homeTeam.crest,
    awayTeamCrestUrl: match.awayTeam.crest,
    ...normalizeScore(match.score),
  }));
}

interface FootballDataStandingRow {
  position: number;
  team: { name: string | null; crest: string | null };
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  points: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
}

interface FootballDataStandingsGroup {
  stage: string;
  type: string;
  group: string | null;
  table: FootballDataStandingRow[];
}

interface FootballDataStandingsResponse {
  standings: FootballDataStandingsGroup[];
}

export interface NormalizedGroupStanding {
  group: string;
  position: number;
  teamName: string;
  teamCrestUrl: string | null;
  playedGames: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

/** Official group-stage tables (with FIFA tiebreakers already applied by the provider). */
export async function fetchGroupStandings(): Promise<NormalizedGroupStanding[]> {
  const data = (await footballDataFetch(
    `/competitions/${WORLD_CUP_COMPETITION_CODE}/standings`,
  )) as FootballDataStandingsResponse;

  return data.standings
    .filter((standing) => standing.type === "TOTAL" && standing.group)
    .flatMap((standing) =>
      standing.table.map((row) => ({
        group: standing.group!,
        position: row.position,
        teamName: row.team.name ?? "TBD",
        teamCrestUrl: row.team.crest,
        playedGames: row.playedGames,
        won: row.won,
        drawn: row.draw,
        lost: row.lost,
        goalsFor: row.goalsFor,
        goalsAgainst: row.goalsAgainst,
        goalDifference: row.goalDifference,
        points: row.points,
      })),
    );
}
