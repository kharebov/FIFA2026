import Link from "next/link";
import { formatKickoff, STATUS_LABELS } from "@/lib/format";
import { TeamBadge } from "@/components/team-badge";

export function MatchTable({
  matches,
}: {
  matches: Array<{
    id: string;
    kickoff: Date;
    homeTeam: string;
    awayTeam: string;
    homeTeamCrestUrl?: string | null;
    awayTeamCrestUrl?: string | null;
    homeScore: number | null;
    awayScore: number | null;
    status: keyof typeof STATUS_LABELS;
  }>;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-black/10 dark:border-white/10">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-black/10 dark:divide-white/10">
          {matches.map((match) => (
            <tr key={match.id} className="hover:bg-black/[.02] dark:hover:bg-white/[.03]">
              <td className="p-0">
                <Link href={`/matches/${match.id}`} className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="w-20 shrink-0 text-zinc-500 sm:w-24">{formatKickoff(match.kickoff)}</span>
                  <span className="flex flex-1 min-w-0 justify-end text-right font-medium">
                    <TeamBadge name={match.homeTeam} crestUrl={match.homeTeamCrestUrl} reverse />
                  </span>
                  <span className="w-16 shrink-0 text-center font-semibold">
                    {match.homeScore !== null && match.awayScore !== null
                      ? `${match.homeScore} : ${match.awayScore}`
                      : "vs"}
                  </span>
                  <span className="flex flex-1 min-w-0 font-medium">
                    <TeamBadge name={match.awayTeam} crestUrl={match.awayTeamCrestUrl} />
                  </span>
                  <span className="hidden w-20 shrink-0 text-right text-xs text-zinc-500 sm:block">
                    {STATUS_LABELS[match.status]}
                  </span>
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
