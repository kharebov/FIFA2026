import Link from "next/link";
import { formatKickoff, STATUS_LABELS } from "@/lib/format";
import { TeamBadge } from "@/components/team-badge";

type MatchRow = {
  id: string;
  kickoff: Date;
  homeTeam: string;
  awayTeam: string;
  homeTeamCrestUrl?: string | null;
  awayTeamCrestUrl?: string | null;
  homeScore: number | null;
  awayScore: number | null;
  homePenalties?: number | null;
  awayPenalties?: number | null;
  status: keyof typeof STATUS_LABELS;
};

export function MatchTable({ matches }: { matches: MatchRow[] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-black/10 dark:divide-white/10">
          {matches.map((match) => (
            <tr key={match.id} className="hover:bg-black/[.02] dark:hover:bg-white/[.03]">
              <td className="p-0">
                <Link href={`/matches/${match.id}`} className="block px-3 py-3 sm:px-4">
                  {/* Mobile: stacked two-line layout, no fixed-width columns to overflow. */}
                  <div className="flex flex-col items-center gap-1 sm:hidden">
                    <span className="text-xs text-zinc-500">
                      {formatKickoff(match.kickoff)} · {STATUS_LABELS[match.status]}
                    </span>
                    <div className="flex w-full items-center justify-center gap-2">
                      <span className="flex min-w-0 flex-1 justify-end">
                        <TeamBadge name={match.homeTeam} crestUrl={match.homeTeamCrestUrl} reverse size={18} />
                      </span>
                      <ScoreCell match={match} />
                      <span className="flex min-w-0 flex-1">
                        <TeamBadge name={match.awayTeam} crestUrl={match.awayTeamCrestUrl} size={18} />
                      </span>
                    </div>
                  </div>

                  {/* Desktop/tablet: single-row layout. */}
                  <div className="hidden items-center justify-between gap-4 sm:flex">
                    <span className="w-24 shrink-0 text-zinc-500">{formatKickoff(match.kickoff)}</span>
                    <span className="flex flex-1 min-w-0 justify-end text-right font-medium">
                      <TeamBadge name={match.homeTeam} crestUrl={match.homeTeamCrestUrl} reverse />
                    </span>
                    <ScoreCell match={match} />
                    <span className="flex flex-1 min-w-0 font-medium">
                      <TeamBadge name={match.awayTeam} crestUrl={match.awayTeamCrestUrl} />
                    </span>
                    <span className="w-20 shrink-0 text-right text-xs text-zinc-500">
                      {STATUS_LABELS[match.status]}
                    </span>
                  </div>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ScoreCell({ match }: { match: MatchRow }) {
  const hasPenalties = match.homePenalties !== null && match.homePenalties !== undefined;

  return (
    <span className="flex w-14 shrink-0 flex-col items-center text-center sm:w-16">
      <span className="font-semibold">
        {match.homeScore !== null && match.awayScore !== null ? `${match.homeScore} : ${match.awayScore}` : "vs"}
      </span>
      {hasPenalties && (
        <span className="text-xs text-zinc-500">
          ({match.homePenalties} : {match.awayPenalties})
        </span>
      )}
    </span>
  );
}
