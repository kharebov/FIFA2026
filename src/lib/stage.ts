// Stage identifiers as returned by football-data.org for the World Cup.
export const STAGE_ORDER = [
  "GROUP_STAGE",
  "LAST_32",
  "LAST_16",
  "QUARTER_FINALS",
  "SEMI_FINALS",
  "THIRD_PLACE",
  "FINAL",
] as const;

export type Stage = (typeof STAGE_ORDER)[number];

export const STAGE_LABELS: Record<Stage, string> = {
  GROUP_STAGE: "Групповой этап",
  LAST_32: "1/16 финала",
  LAST_16: "1/8 финала",
  QUARTER_FINALS: "1/4 финала",
  SEMI_FINALS: "1/2 финала",
  THIRD_PLACE: "Матч за 3-е место",
  FINAL: "Финал",
};

export function stageLabel(stage: string): string {
  return STAGE_LABELS[stage as Stage] ?? stage;
}

function stageIndex(stage: string): number {
  const index = STAGE_ORDER.indexOf(stage as Stage);
  return index === -1 ? STAGE_ORDER.length : index;
}

/**
 * The tournament's current stage: the earliest stage (in bracket order) that
 * still has an unfinished match. Once every stage is finished, the final is
 * reported as current (the tournament is over).
 */
export function getCurrentStage(matches: { stage: string; status: string }[]): Stage {
  for (const stage of STAGE_ORDER) {
    const stageMatches = matches.filter((m) => m.stage === stage);
    if (stageMatches.length === 0) continue;
    if (stageMatches.some((m) => m.status !== "FINISHED")) return stage;
  }
  return STAGE_ORDER[STAGE_ORDER.length - 1];
}

export function isPastStage(stage: string, currentStage: Stage): boolean {
  return stageIndex(stage) < stageIndex(currentStage);
}
