import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { ButtonLink } from "@/components/button";
import { UserAvatar } from "@/components/avatar";
import { RankBadge } from "@/components/rank-badge";
import { TeamBadge } from "@/components/team-badge";
import { formatKickoff } from "@/lib/format";
import { stageLabel } from "@/lib/stage";

const SCORING_RULES = [
  { icon: "🏆", title: "Победитель", points: 3, description: "Угадали, кто победит в матче" },
  { icon: "🤝", title: "Ничья", points: 1, description: "Угадали, что матч закончится вничью" },
  { icon: "🎯", title: "Точный счёт", points: 5, description: "Угадали счёт матча до цифры" },
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
        predictions: { select: { points: true } },
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
      displayName: user.name ?? user.email ?? "Игрок",
      avatarId: user.avatarId,
      totalPoints: user.predictions.reduce((sum, p) => sum + (p.points ?? 0), 0),
    }))
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .slice(0, 5);

  return (
    <div className="flex flex-col gap-12">
      <section className="flex flex-col gap-4 rounded-2xl border border-black/10 bg-gradient-to-br from-white to-zinc-100 px-6 py-10 dark:border-white/10 dark:from-white/[.04] dark:to-transparent sm:px-10">
        <span className="w-fit rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
          11 июня — 19 июля 2026
        </span>
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Прогнозы на Чемпионат мира по футболу 2026
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Ставьте на победителя, ничью или точный счёт каждого матча. Следите за расписанием,
          результатами и своим местом в общем рейтинге.
        </p>
        <div className="flex gap-4">
          <ButtonLink href="/matches">Смотреть матчи</ButtonLink>
          <ButtonLink href="/leaderboard" variant="secondary">
            Полный рейтинг
          </ButtonLink>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {SCORING_RULES.map((rule) => (
          <div
            key={rule.title}
            className="flex flex-col gap-2 rounded-xl border border-black/10 px-5 py-4 dark:border-white/10"
          >
            <span className="text-2xl">{rule.icon}</span>
            <div className="flex items-center justify-between">
              <span className="font-semibold">{rule.title}</span>
              <span className="text-sm font-medium text-zinc-500">{rule.points} очк.</span>
            </div>
            <p className="text-sm text-zinc-500">{rule.description}</p>
          </div>
        ))}
      </section>

      {nextMatch && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-semibold">Ближайший матч</h2>
          <Link
            href={`/matches/${nextMatch.id}`}
            className="flex flex-col gap-3 rounded-xl border border-black/10 px-5 py-4 hover:bg-black/[.02] dark:border-white/10 dark:hover:bg-white/[.03] sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-xs text-zinc-500">
              {stageLabel(nextMatch.stage)} {nextMatch.group ? `· ${nextMatch.group}` : ""}
            </span>
            <div className="flex flex-1 items-center justify-center gap-4 text-base font-medium sm:gap-6">
              <TeamBadge name={nextMatch.homeTeam} crestUrl={nextMatch.homeTeamCrestUrl} reverse size={24} />
              <span className="text-sm text-zinc-400">vs</span>
              <TeamBadge name={nextMatch.awayTeam} crestUrl={nextMatch.awayTeamCrestUrl} size={24} />
            </div>
            <span className="text-sm text-zinc-500">{formatKickoff(nextMatch.kickoff)}</span>
          </Link>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Топ-5 игроков</h2>
          <Link href="/leaderboard" className="text-sm text-zinc-500 hover:underline">
            Весь рейтинг →
          </Link>
        </div>
        {leaders.length === 0 ? (
          <p className="text-sm text-zinc-500">Пока никто не сделал ставок.</p>
        ) : (
          <ol className="flex flex-col divide-y divide-black/10 rounded-lg border border-black/10 dark:divide-white/10 dark:border-white/10">
            {leaders.map((leader, index) => (
              <li key={leader.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span className="flex items-center gap-3">
                  <RankBadge position={index + 1} size={24} />
                  <UserAvatar name={leader.displayName} avatarId={leader.avatarId} size={24} />
                  {leader.displayName}
                </span>
                <span className="font-medium">{leader.totalPoints} очк.</span>
              </li>
            ))}
          </ol>
        )}
      </section>
    </div>
  );
}
