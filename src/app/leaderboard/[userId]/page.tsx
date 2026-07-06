import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/avatar";
import { PredictionHistoryTable } from "@/components/prediction-history-table";
import { formatPoints } from "@/lib/format";

export default async function PlayerHistoryPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.isBlocked) notFound();

  const predictions = await prisma.prediction.findMany({
    where: { userId },
    include: { match: true },
    orderBy: { match: { kickoff: "desc" } },
  });

  const scored = predictions.filter((p) => p.points !== null || p.advancementPoints !== null);
  const totalPoints = scored.reduce(
    (sum, p) => sum + (p.points ?? 0) + (p.advancementPoints ?? 0),
    0,
  );
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
        приносить 0 очок, навіть якщо переможець вгаданий правильно. Окремо, для матчів плей-офф,
        є ставка «хто вийде далі» (1 очко) — вона враховує перемогу по пенальті, на відміну від
        основної ставки вище.
      </p>

      <PredictionHistoryTable predictions={predictions} emptyMessage="Цей гравець ще не робив ставок." />
    </div>
  );
}
