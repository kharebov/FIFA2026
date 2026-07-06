import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MatchTable } from "@/components/match-table";
import { PredictionHistoryTable } from "@/components/prediction-history-table";
import { formatPoints } from "@/lib/format";

export default async function MyPredictionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const now = new Date();

  const [user, predictions, openMatches] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: session.user.id } }),
    prisma.prediction.findMany({
      where: { userId: session.user.id },
      include: { match: true },
      orderBy: { match: { kickoff: "desc" } },
    }),
    prisma.match.findMany({
      where: { kickoff: { gt: now } },
      orderBy: { kickoff: "asc" },
    }),
  ]);

  const predictedMatchIds = new Set(predictions.map((p) => p.matchId));
  const notYetPredicted = openMatches.filter((m) => !predictedMatchIds.has(m.id));

  const scored = predictions.filter((p) => p.points !== null || p.advancementPoints !== null);
  const totalPoints = scored.reduce(
    (sum, p) => sum + (p.points ?? 0) + (p.advancementPoints ?? 0),
    0,
  );

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Мій прогноз</h1>
        <p className="text-sm text-zinc-500">
          {formatPoints(totalPoints)} · {scored.length} зіграно ставок
        </p>
      </div>

      {user.isBlocked && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          Ваш акаунт заблоковано адміністратором. Ставки тимчасово недоступні.
        </p>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Ще можна зробити ставку</h2>
        {notYetPredicted.length === 0 ? (
          <p className="text-sm text-zinc-500">
            Ви зробили ставки на всі доступні матчі. Нові з&apos;являться після оновлення розкладу.
          </p>
        ) : (
          <MatchTable matches={notYetPredicted} />
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Мої ставки</h2>
        <p className="text-xs text-zinc-500">
          Нарахування очок: перемога — 3, нічия — 1, точний рахунок — 5. Ставка «хто вийде далі»
          (для матчів плей-офф) — 1 очко, враховує перемогу по пенальті.
        </p>
        <PredictionHistoryTable predictions={predictions} emptyMessage="Ви ще не робили ставок." />
      </section>
    </div>
  );
}
