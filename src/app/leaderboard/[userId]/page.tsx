import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/avatar";
import { TeamBadge } from "@/components/team-badge";
import { BET_TYPE_LABELS, formatKickoff, formatPoints } from "@/lib/format";

export default async function PlayerHistoryPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isBlocked) notFound();

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { match: true },
    orderBy: { match: { kickoff: "desc" } },
  });

  const scored = predictions.filter((p) => p.points !== null);
  const totalPoints = scored.reduce((sum, p) => sum + (p.points ?? 0), 0);
  const displayName = user.name ?? user.email ?? "Гравець";

  return (
    <div className="flex flex-col gap-6">
      <Link href="/leaderboard" className="text-sm text-zinc-500 hover:underline">
        ← Рейтинг
      </Link>

      <div className="flex items-center gap-4">
        <UserAvatar name={displayName} avatarId={user.avatarId} size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{displayName}</h1>
          <p className="text-sm text-zinc-500">
            {formatPoints(totalPoints)} · {scored.length} зіграно ставок
          </p>
        </div>
      </div>

      <p className="text-xs text-zinc-500">
        Нарахування очок: перемога — 3, нічия — 1, точний рахунок — 5. Очки даються лише за той
        варіант, який був обраний у ставці — наприклад, ставка на точний рахунок без влучення
        приносить 0 очок, навіть якщо переможець вгаданий правильно.
      </p>

      {predictions.length === 0 ? (
        <p className="text-sm text-zinc-500">Цей гравець ще не робив ставок.</p>
      ) : (
        <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
          <table className="w-full text-sm">
            <thead className="bg-black/[.02] text-left text-xs uppercase text-zinc-500 dark:bg-white/[.03]">
              <tr>
                <th className="px-4 py-2 font-medium">Матч</th>
                <th className="px-4 py-2 font-medium">Ставка</th>
                <th className="px-4 py-2 font-medium">Результат</th>
                <th className="px-4 py-2 text-right font-medium">Очки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/10 dark:divide-white/10">
              {predictions.map((prediction) => {
                const { match } = prediction;
                const hasResult =
                  match.status === "FINISHED" && match.homeScore !== null && match.awayScore !== null;

                const betLabel =
                  prediction.betType === "EXACT_SCORE"
                    ? `${prediction.homeScore} : ${prediction.awayScore}`
                    : BET_TYPE_LABELS[prediction.betType];

                return (
                  <tr key={prediction.id}>
                    <td className="px-4 py-3">
                      <Link href={`/matches/${match.id}`} className="flex flex-col gap-1 hover:underline">
                        <span className="flex items-center gap-2 font-medium">
                          <TeamBadge name={match.homeTeam} crestUrl={match.homeTeamCrestUrl} size={16} />
                          <span className="text-zinc-400">–</span>
                          <TeamBadge name={match.awayTeam} crestUrl={match.awayTeamCrestUrl} size={16} />
                        </span>
                        <span className="text-xs text-zinc-500">{formatKickoff(match.kickoff)}</span>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">{betLabel}</td>
                    <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                      {hasResult ? `${match.homeScore} : ${match.awayScore}` : "ще не зіграно"}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {prediction.points !== null ? (
                        <span className={prediction.points > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}>
                          {prediction.points > 0 ? `+${prediction.points}` : prediction.points}
                        </span>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
