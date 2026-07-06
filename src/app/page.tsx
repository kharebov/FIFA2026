import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/button";
import { UserAvatar } from "@/components/avatar";
import { RankBadge } from "@/components/rank-badge";
import { TeamBadge } from "@/components/team-badge";
import { formatKickoff, formatPoints } from "@/lib/format";
import { stageLabel } from "@/lib/stage";

const SCORING_RULES = [
  { icon: "🏆", title: "Переможець", points: 3, description: "Вгадали, хто переможе в матчі" },
  { icon: "🤝", title: "Нічия", points: 1, description: "Вгадали, що матч закінчиться внічию" },
  { icon: "🎯", title: "Точний рахунок", points: 5, description: "Вгадали рахунок матчу до цифри" },
  {
    icon: "⏭️",
    title: "Прохід далі",
    points: 1,
    description: "Окрема ставка для матчів плей-офф: яка команда вийде в наступний раунд (враховує перемогу по пенальті)",
  },
];

export default async function Home() {
  const [topUsers, nextMatch] = await Promise.all([
    prisma.user.findMany({
      where: { isBlocked: false },
      select: {
        id: true,
        name: true,
        email: true,
        avatarId: true,
        predictions: { select: { points: true, advancementPoints: true } },
      },
    }),
    prisma.match.findFirst({
      where: { status: "SCHEDULED", homeTeam: { not: "TBD" }, awayTeam: { not: "TBD" } },
      orderBy: { kickoff: "asc" },
    }),
  ]);

  const leaders = topUsers
    .map((user) => ({
      id: user.id,
      displayName: user.name ?? user.email ?? "Гравець",
      avatarId: user.avatarId,
      totalPoints: user.predictions.reduce(
        (sum, p) => sum + (p.points ?? 0) + (p.advancementPoints ?? 0),
        0,
      ),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-gradient-to-br from-white to-zinc-100 px-6 py-10 dark:border-white/10 dark:from-white/[.04] dark:to-transparent sm:px-10">
        <span className="w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
          11 червня — 19 липня 2026
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Прогнози на Чемпіонат світу з футболу 2026
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Робіть ставки на переможця, нічию або точний рахунок кожного матчу, а для плей-офф —
          ще й окрему ставку на прохід далі. Слідкуйте за розкладом, результатами та своїм місцем
          у загальному рейтингу.
        </p>
        <div className="flex gap-4">
          <ButtonLink href="/matches">Дивитися матчі</ButtonLink>
          <ButtonLink href="/leaderboard" variant="secondary">
            Повний рейтинг
          </ButtonLink>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SCORING_RULES.map((rule) => (
          <div
            key={rule.title}
            className="flex flex-col gap-2 rounded-xl border border-black/10 px-5 py-4 dark:border-white/10"
          >
            <span className="text-2xl">{rule.icon}</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{rule.title}</span>
              <span className="text-sm font-medium text-zinc-500">{formatPoints(rule.points)}</span>
            </div>
            <p className="text-sm text-zinc-500">{rule.description}</p>
          </div>
        ))}
      </section>

      {nextMatch && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Найближчий матч</h2>
          <Link
            href={`/matches/${nextMatch.id}`}
            className="flex flex-col gap-3 rounded-xl border border-black/10 px-5 py-4 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.03] sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-xs text-zinc-500">
              {stageLabel(nextMatch.stage)} {nextMatch.group ? `· ${nextMatch.group}` : ""}
            </span>
            <div className="flex w-full min-w-0 flex-1 items-center justify-center gap-2 text-base font-medium sm:gap-6">
              <span className="flex min-w-0 flex-1 justify-end">
                <TeamBadge name={nextMatch.homeTeam} crestUrl={nextMatch.homeTeamCrestUrl} reverse size={24} />
              </span>
              <span className="shrink-0 text-sm text-zinc-400">vs</span>
              <span className="flex min-w-0 flex-1">
                <TeamBadge name={nextMatch.awayTeam} crestUrl={nextMatch.awayTeamCrestUrl} size={24} />
              </span>
            </div>
            <span className="text-sm text-zinc-500">{formatKickoff(nextMatch.kickoff)}</span>
          </Link>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Топ-5 гравців</h2>
          <Link href="/leaderboard" className="text-sm text-zinc-500 hover:underline">
            Увесь рейтинг →
          </Link>
        </div>
        {leaders.length === 0 ? (
          <p className="text-sm text-zinc-500">Поки ніхто не зробив ставок.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
            {leaders.map((leader, index) => (
              <li key={leader.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <Link href={`/leaderboard/${leader.id}`} className="flex items-center gap-3 hover:underline">
                  <RankBadge position={index + 1} size={24} />
                  <UserAvatar name={leader.displayName} avatarId={leader.avatarId} size={24} />
                  {leader.displayName}
                </Link>
                <span className="font-medium">{formatPoints(leader.totalPoints)}</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
