import Link from "next/link";
import { TeamBadge } from "@/components/team-badge";
import { BET_TYPE_LABELS, formatKickoff } from "@/lib/format";
import { AdvanceSide, BetType } from "@/generated/prisma/client";

type PredictionRow = {
  id: string;
  betType: BetType;
  homeScore: number | null;
  awayScore: number | null;
  advancesTeam: AdvanceSide | null;
  points: number | null;
  advancementPoints: number | null;
  match: {
    id: string;
    kickoff: Date;
    homeTeam: string;
    awayTeam: string;
    homeTeamCrestUrl: string | null;
    awayTeamCrestUrl: string | null;
    homeScore: number | null;
    awayScore: number | null;
    homePenalties: number | null;
    awayPenalties: number | null;
    status: string;
  };
};

export function PredictionHistoryTable({
  predictions,
  emptyMessage,
}: {
  predictions: PredictionRow[];
  emptyMessage: string;
}) {
  if (predictions.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full min-w-[640px] text-sm">
        <thead className="bg-black/[.02] text-left text-xs uppercase text-zinc-500 dark:bg-white/[.03]">
          <tr>
            <th className="px-4 py-2 font-medium">Матч</th>
            <th className="px-4 py-2 font-medium">Ставка</th>
            <th className="px-4 py-2 font-medium">Прохід далі</th>
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
                  {prediction.advancesTeam ? (
                    prediction.advancesTeam === "HOME" ? match.homeTeam : match.awayTeam
                  ) : (
                    <span className="text-zinc-400">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400">
                  {hasResult ? (
                    <>
                      {match.homeScore} : {match.awayScore}
                      {match.homePenalties !== null && (
                        <span className="text-xs text-zinc-500">
                          {" "}
                          (пен. {match.homePenalties}:{match.awayPenalties})
                        </span>
                      )}
                    </>
                  ) : (
                    "ще не зіграно"
                  )}
                </td>
                <td className="px-4 py-3 text-right font-semibold">
                  {(() => {
                    const rowTotal = (prediction.points ?? 0) + (prediction.advancementPoints ?? 0);
                    const anyScored = prediction.points !== null || prediction.advancementPoints !== null;
                    if (!anyScored) return <span className="text-zinc-400">—</span>;
                    return (
                      <span className={rowTotal > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-500"}>
                        {rowTotal > 0 ? `+${rowTotal}` : rowTotal}
                      </span>
                    );
                  })()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
