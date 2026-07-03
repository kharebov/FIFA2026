import { prisma } from "@/lib/prisma";
import { MatchTable } from "@/components/match-table";
import { TeamBadge } from "@/components/team-badge";
import { STAGE_ORDER, stageLabel, getCurrentStage, isPastStage } from "@/lib/stage";

export default async function StandingsPage() {
  const [matches, standings] = await Promise.all([
    prisma.match.findMany({ orderBy: { kickoff: "asc" } }),
    prisma.groupStanding.findMany({ orderBy: [{ group: "asc" }, { position: "asc" }] }),
  ]);

  const currentStage = getCurrentStage(matches);

  const groups = new Map<string, typeof standings>();
  for (const row of standings) {
    if (!groups.has(row.group)) groups.set(row.group, []);
    groups.get(row.group)!.push(row);
  }
  const sortedGroups = [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));

  const knockoutStages = STAGE_ORDER.filter((stage) => stage !== "GROUP_STAGE").map((stage) => ({
    stage,
    matches: matches.filter((m) => m.stage === stage),
  }));

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Турнірна таблиця</h1>
        <p className="text-sm text-zinc-500">
          Поточний етап: <span className="font-medium text-zinc-900 dark:text-zinc-100">{stageLabel(currentStage)}</span>
        </p>
      </div>

      <section className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold">Груповий етап</h2>
        {sortedGroups.length === 0 ? (
          <p className="text-sm text-zinc-500">Таблиці груп з&apos;являться після синхронізації розкладу.</p>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sortedGroups.map(([group, rows]) => (
              <GroupTable key={group} group={group} rows={rows} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-8">
        <h2 className="text-lg font-semibold">Плей-офф</h2>
        {knockoutStages.every(({ matches }) => matches.length === 0) ? (
          <p className="text-sm text-zinc-500">Сітка плей-офф ще не сформована.</p>
        ) : (
          knockoutStages
            .filter(({ matches }) => matches.length > 0)
            .map(({ stage, matches: stageMatches }) => (
              <div key={stage} className="flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">{stageLabel(stage)}</h3>
                  <span className="text-xs text-zinc-500">
                    {stage === currentStage
                      ? "триває зараз"
                      : isPastStage(stage, currentStage)
                        ? "завершено"
                        : "попереду"}
                  </span>
                </div>
                <MatchTable matches={stageMatches} />
              </div>
            ))
        )}
      </section>
    </div>
  );
}

function GroupTable({
  group,
  rows,
}: {
  group: string;
  rows: Array<{
    id: string;
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
  }>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
      <div className="border-b border-black/10 bg-black/[.02] px-3 py-2 text-sm font-medium dark:border-white/10 dark:bg-white/[.03]">
        {group}
      </div>
      <table className="w-full text-xs">
        <thead className="text-zinc-500">
          <tr>
            <th className="px-2 py-1.5 text-left font-medium">Команда</th>
            <th className="px-1 py-1.5 font-medium">І</th>
            <th className="px-1 py-1.5 font-medium">В</th>
            <th className="px-1 py-1.5 font-medium">Н</th>
            <th className="px-1 py-1.5 font-medium">П</th>
            <th className="px-1 py-1.5 font-medium">М&apos;ячі</th>
            <th className="px-1 py-1.5 font-medium">Р</th>
            <th className="px-2 py-1.5 font-medium">О</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/5 dark:divide-white/5">
          {rows.map((row) => (
            <tr key={row.id}>
              <td className="px-2 py-1.5 font-medium">
                <TeamBadge name={row.teamName} crestUrl={row.teamCrestUrl} size={16} />
              </td>
              <td className="px-1 py-1.5 text-center">{row.playedGames}</td>
              <td className="px-1 py-1.5 text-center">{row.won}</td>
              <td className="px-1 py-1.5 text-center">{row.drawn}</td>
              <td className="px-1 py-1.5 text-center">{row.lost}</td>
              <td className="px-1 py-1.5 text-center text-zinc-500">
                {row.goalsFor}-{row.goalsAgainst}
              </td>
              <td className="px-1 py-1.5 text-center">
                {row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}
              </td>
              <td className="px-2 py-1.5 text-center font-semibold">{row.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
