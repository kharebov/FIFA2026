import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatKickoff, formatPoints, isBettingOpen, STATUS_LABELS, BET_TYPE_LABELS } from "@/lib/format";
import { stageLabel } from "@/lib/stage";
import { teamFlag } from "@/lib/flags";
import { PredictionForm } from "./prediction-form";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const match = await prisma.match.findUnique({ where: { id } });
  if (!match) notFound();

  const session = await auth();
  const myPrediction = session?.user
    ? await prisma.prediction.findUnique({
        where: { userId_matchId: { userId: session.user.id, matchId: match.id } },
      })
    : null;

  const bettingOpen = isBettingOpen(match.kickoff);
  const hasResult = match.status === "FINISHED" && match.homeScore !== null && match.awayScore !== null;

  const homeFlag = teamFlag(match.homeTeam);
  const awayFlag = teamFlag(match.awayTeam);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-center gap-4 rounded-2xl border border-black/10 bg-white px-6 py-8 text-center dark:border-white/10 dark:bg-white/[.03]">
        <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-medium text-zinc-600 dark:bg-white/10 dark:text-zinc-300">
          {stageLabel(match.stage)} {match.group ? `· ${match.group}` : ""}
        </span>
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <TeamHero name={match.homeTeam} crestUrl={match.homeTeamCrestUrl} flag={homeFlag} />
          <span className="flex flex-col items-center">
            <span className="text-2xl font-bold text-zinc-400">
              {hasResult ? `${match.homeScore} : ${match.awayScore}` : "vs"}
            </span>
            {match.homePenalties !== null && (
              <span className="text-sm text-zinc-400">
                (пен. {match.homePenalties} : {match.awayPenalties})
              </span>
            )}
          </span>
          <TeamHero name={match.awayTeam} crestUrl={match.awayTeamCrestUrl} flag={awayFlag} />
        </div>
        <span className="text-sm text-zinc-500">
          {formatKickoff(match.kickoff)} · {STATUS_LABELS[match.status]}
        </span>
      </div>

      <div className="mx-auto w-full max-w-sm">
        {!session?.user ? (
          <p className="text-center text-sm text-zinc-500">
            Щоб зробити ставку, потрібно увійти в акаунт.
          </p>
        ) : session.user.isBlocked ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
            Ваш акаунт заблоковано адміністратором. Ставки тимчасово недоступні.
          </p>
        ) : bettingOpen ? (
          <PredictionForm
            matchId={match.id}
            homeTeam={match.homeTeam}
            awayTeam={match.awayTeam}
            existing={myPrediction}
          />
        ) : (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-black/10 px-4 py-4 text-center text-sm dark:border-white/10">
            <p className="text-zinc-500">Ставки на цей матч закриті.</p>
            {myPrediction ? (
              <p>
                Ваша ставка: <strong>{BET_TYPE_LABELS[myPrediction.betType]}</strong>
                {myPrediction.betType === "EXACT_SCORE" &&
                  ` (${myPrediction.homeScore}:${myPrediction.awayScore})`}
                {myPrediction.points !== null && <> — {formatPoints(myPrediction.points)}</>}
              </p>
            ) : (
              <p className="text-zinc-500">Ви не робили ставку на цей матч.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TeamHero({ name, crestUrl, flag }: { name: string; crestUrl: string | null; flag: string | null }) {
  const isTbd = name === "TBD";

  return (
    <div className="flex w-24 flex-col items-center gap-2 sm:w-32">
      <div className="flex h-14 w-14 items-center justify-center sm:h-16 sm:w-16">
        {crestUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crestUrl} alt="" className="h-full w-full object-contain" />
        ) : isTbd ? (
          <span className="flex h-full w-full items-center justify-center rounded-full border border-dashed border-black/20 text-lg text-zinc-400 dark:border-white/20">
            ?
          </span>
        ) : (
          <span className="text-4xl">{flag}</span>
        )}
      </div>
      <span className={`text-sm font-semibold sm:text-base ${isTbd ? "italic text-zinc-400" : ""}`}>{name}</span>
    </div>
  );
}
