import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatchTable } from "@/components/match-table";

export default async function MatchesPage() {
  const session = await auth();

  const [matches, myPredictions] = await Promise.all([
    prisma.match.findMany({ orderBy: { kickoff: "asc" } }),
    session?.user
      ? prisma.prediction.findMany({ where: { userId: session.user.id }, select: { matchId: true } })
      : Promise.resolve([]),
  ]);

  const predictedMatchIds = session?.user ? new Set(myPredictions.map((p) => p.matchId)) : undefined;

  const upcoming = matches.filter((m) => m.status === "SCHEDULED" || m.status === "LIVE");
  const finished = matches
    .filter((m) => m.status === "FINISHED" || m.status === "POSTPONED" || m.status === "CANCELLED")
    .sort((a, b) => b.kickoff.getTime() - a.kickoff.getTime());

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">Розклад</h1>
          {predictedMatchIds && (
            <div className="flex items-center gap-4 text-xs text-zinc-500">
              <span className="flex items-center gap-1.5">
                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] leading-none text-white">
                  ✓
                </span>
                ставку зроблено
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border border-dashed border-zinc-300 dark:border-zinc-600" />
                ще не зроблено
              </span>
            </div>
          )}
        </div>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-500">Розклад поки не завантажено.</p>
        ) : (
          <MatchTable matches={upcoming} predictedMatchIds={predictedMatchIds} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Минулі матчі</h2>
        {finished.length === 0 ? (
          <p className="text-sm text-zinc-500">Ще немає зіграних матчів.</p>
        ) : (
          <MatchTable matches={finished} predictedMatchIds={predictedMatchIds} />
        )}
      </section>
    </div>
  );
}
