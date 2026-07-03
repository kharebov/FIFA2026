import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/avatar";
import { RankBadge } from "@/components/rank-badge";

export default async function LeaderboardPage() {
  const [session, users] = await Promise.all([
    auth(),
    prisma.user.findMany({
      where: { isBlocked: false },
      select: {
        id: true,
        name: true,
        email: true,
        avatarId: true,
        predictions: { select: { points: true } },
      },
    }),
  ]);

  const ranking = users
    .map((user) => {
      const scored = user.predictions.filter((p) => p.points !== null);
      return {
        id: user.id,
        displayName: user.name ?? user.email ?? "Игрок",
        avatarId: user.avatarId,
        totalPoints: scored.reduce((sum, p) => sum + (p.points ?? 0), 0),
        matchesScored: scored.length,
      };
    })
    .sort((a, b) => b.totalPoints - a.totalPoints);

  const podium = ranking.slice(0, 3);
  const myId = session?.user?.id;

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold tracking-tight">Рейтинг игроков</h1>

      {ranking.length === 0 ? (
        <p className="text-sm text-zinc-500">Пока нет ни одного игрока.</p>
      ) : (
        <>
          {podium.length > 0 && <Podium leaders={podium} myId={myId} />}

          <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
            <table className="w-full text-sm">
              <thead className="bg-black/[.02] text-left text-xs uppercase text-zinc-500 dark:bg-white/[.03]">
                <tr>
                  <th className="px-4 py-2 font-medium">#</th>
                  <th className="px-4 py-2 font-medium">Игрок</th>
                  <th className="px-4 py-2 font-medium">Сыграно ставок</th>
                  <th className="px-4 py-2 text-right font-medium">Очки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/10 dark:divide-white/10">
                {ranking.map((user, index) => (
                  <tr
                    key={user.id}
                    className={user.id === myId ? "bg-amber-50 dark:bg-amber-400/10" : undefined}
                  >
                    <td className="px-4 py-3">
                      <RankBadge position={index + 1} size={24} />
                    </td>
                    <td className="px-4 py-3 font-medium">
                      <span className="flex items-center gap-2">
                        <UserAvatar name={user.displayName} avatarId={user.avatarId} size={24} />
                        {user.displayName}
                        {user.id === myId && (
                          <span className="text-xs font-normal text-zinc-500">(вы)</span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">{user.matchesScored}</td>
                    <td className="px-4 py-3 text-right font-semibold">{user.totalPoints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Podium({
  leaders,
  myId,
}: {
  leaders: Array<{ id: string; displayName: string; avatarId: number | null; totalPoints: number }>;
  myId?: string;
}) {
  // Center the #1 spot visually: order as [2nd, 1st, 3rd].
  const order = [leaders[1], leaders[0], leaders[2]].filter(Boolean);
  const heightByPosition: Record<number, string> = { 1: "h-28", 2: "h-20", 3: "h-14" };

  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6">
      {order.map((leader) => {
        const position = leaders.indexOf(leader) + 1;
        return (
          <div key={leader.id} className="flex w-24 flex-col items-center gap-2 sm:w-28">
            <UserAvatar name={leader.displayName} avatarId={leader.avatarId} size={48} />
            <span className={`truncate text-sm font-medium ${leader.id === myId ? "text-amber-600 dark:text-amber-400" : ""}`}>
              {leader.displayName}
            </span>
            <span className="text-xs text-zinc-500">{leader.totalPoints} очк.</span>
            <div
              className={`flex w-full items-start justify-center rounded-t-lg pt-2 ${heightByPosition[position]} ${
                position === 1
                  ? "bg-amber-400/80"
                  : position === 2
                    ? "bg-zinc-300/80 dark:bg-zinc-600/60"
                    : "bg-orange-300/80 dark:bg-orange-800/50"
              }`}
            >
              <RankBadge position={position} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
