"use client";

import { useActionState, useState } from "react";
import { submitAdvancementBet } from "./actions";
import { AdvanceSide } from "@/generated/prisma/client";
import { formatPoints } from "@/lib/format";
import { teamFlag } from "@/lib/flags";
import { Button } from "@/components/button";

const ADVANCEMENT_POINTS = 1;

export function AdvancementForm({
  matchId,
  homeTeam,
  awayTeam,
  existing,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  existing: AdvanceSide | null;
}) {
  const [state, formAction, pending] = useActionState(submitAdvancementBet, undefined);
  const [advancesTeam, setAdvancesTeam] = useState<AdvanceSide>(existing ?? "HOME");

  return (
    <form action={formAction} className="flex flex-col gap-3 rounded-lg border border-black/10 p-4 dark:border-white/10">
      <input type="hidden" name="matchId" value={matchId} />

      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Хто вийде далі?</span>
        <span className="text-xs text-zinc-500">{formatPoints(ADVANCEMENT_POINTS)}</span>
      </div>
      <p className="text-xs text-zinc-500">
        Окрема ставка — враховує перемогу по пенальті. Основна ставка вище завжди про рахунок в
        основний/додатковий час, без урахування серії пенальті.
      </p>

      <div className="flex flex-col gap-2">
        {(["HOME", "AWAY"] as const).map((side) => {
          const team = side === "HOME" ? homeTeam : awayTeam;
          const flag = teamFlag(team);
          return (
            <label
              key={side}
              className="flex items-center gap-2 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20"
            >
              <input
                type="radio"
                name="advancesTeam"
                value={side}
                checked={advancesTeam === side}
                onChange={() => setAdvancesTeam(side)}
              />
              {flag && <span>{flag}</span>}
              {team}
            </label>
          );
        })}
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Ставку збережено</p>}

      <Button type="submit" disabled={pending} variant="secondary">
        {pending ? "Зберігаємо..." : existing ? "Змінити ставку" : "Зробити ставку"}
      </Button>
    </form>
  );
}
