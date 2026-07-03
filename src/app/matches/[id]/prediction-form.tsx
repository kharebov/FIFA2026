"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { submitPrediction } from "./actions";
import { BetType } from "@/generated/prisma/client";
import { BET_TYPE_LABELS, BET_TYPE_POINTS } from "@/lib/format";
import { teamFlag } from "@/lib/flags";
import { Button } from "@/components/button";

const BET_TYPES: BetType[] = ["HOME_WIN", "DRAW", "AWAY_WIN", "EXACT_SCORE"];

export function PredictionForm({
  matchId,
  homeTeam,
  awayTeam,
  existing,
}: {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  existing: { betType: BetType; homeScore: number | null; awayScore: number | null } | null;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(submitPrediction, undefined);
  const [betType, setBetType] = useState<BetType>(existing?.betType ?? "HOME_WIN");

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <input type="hidden" name="matchId" value={matchId} />

      <div className="flex flex-col gap-2">
        {BET_TYPES.map((type) => (
          <label
            key={type}
            className="flex items-center justify-between gap-3 rounded-md border border-black/10 px-3 py-2 text-sm dark:border-white/20"
          >
            <span className="flex items-center gap-2">
              <input
                type="radio"
                name="betType"
                value={type}
                checked={betType === type}
                onChange={() => setBetType(type)}
              />
              {type === "HOME_WIN" && teamFlag(homeTeam) && <span>{teamFlag(homeTeam)}</span>}
              {type === "AWAY_WIN" && teamFlag(awayTeam) && <span>{teamFlag(awayTeam)}</span>}
              {type === "HOME_WIN" ? homeTeam : type === "AWAY_WIN" ? awayTeam : BET_TYPE_LABELS[type]}
            </span>
            <span className="text-xs text-zinc-500">{BET_TYPE_POINTS[type]} очк.</span>
          </label>
        ))}
      </div>

      {betType === "EXACT_SCORE" && (
        <div className="flex items-center justify-center gap-3">
          <input
            name="homeScore"
            type="number"
            min={0}
            max={99}
            required
            defaultValue={existing?.homeScore ?? undefined}
            className="w-16 rounded-md border border-black/10 px-3 py-2 text-center dark:border-white/20 dark:bg-transparent"
          />
          <span>:</span>
          <input
            name="awayScore"
            type="number"
            min={0}
            max={99}
            required
            defaultValue={existing?.awayScore ?? undefined}
            className="w-16 rounded-md border border-black/10 px-3 py-2 text-center dark:border-white/20 dark:bg-transparent"
          />
        </div>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Ставка сохранена</p>}

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? "Сохраняем..." : existing ? "Изменить ставку" : "Сделать ставку"}
        </Button>
        {state?.success && (
          <Button type="button" variant="secondary" onClick={() => router.back()}>
            Назад
          </Button>
        )}
      </div>
    </form>
  );
}
