import { prisma } from "@/lib/prisma";
import { MatchTable } from "@/components/match-table";

export default async function MatchesPage() {
  const matches = await prisma.match.findMany({ orderBy: { kickoff: "asc" } });

  const upcoming = matches.filter((m) => m.status === "SCHEDULED" || m.status === "LIVE");
  const finished = matches
    .filter((m) => m.status === "FINISHED" || m.status === "POSTPONED" || m.status === "CANCELLED")
    .sort((a, b) => b.kickoff.getTime() - a.kickoff.getTime());

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Расписание</h1>
        {upcoming.length === 0 ? (
          <p className="text-sm text-zinc-500">Расписание пока не загружено.</p>
        ) : (
          <MatchTable matches={upcoming} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-2xl font-semibold tracking-tight">Прошедшие игры</h2>
        {finished.length === 0 ? (
          <p className="text-sm text-zinc-500">Ещё нет сыгранных матчей.</p>
        ) : (
          <MatchTable matches={finished} />
        )}
      </section>
    </div>
  );
}
