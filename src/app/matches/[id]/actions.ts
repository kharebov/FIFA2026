"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const predictionSchema = z
  .object({
    matchId: z.string().min(1),
    betType: z.enum(["HOME_WIN", "AWAY_WIN", "DRAW", "EXACT_SCORE"]),
    homeScore: z.coerce.number().int().min(0).max(99).optional(),
    awayScore: z.coerce.number().int().min(0).max(99).optional(),
  })
  .refine(
    (data) =>
      data.betType !== "EXACT_SCORE" || (data.homeScore !== undefined && data.awayScore !== undefined),
    { message: "Вкажіть рахунок" },
  );

export async function submitPrediction(_prevState: { error?: string } | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Спочатку увійдіть в акаунт" };
  }
  if (session.user.isBlocked) {
    return { error: "Ваш акаунт заблоковано адміністратором" };
  }

  const parsed = predictionSchema.safeParse({
    matchId: formData.get("matchId"),
    betType: formData.get("betType"),
    homeScore: formData.get("homeScore") || undefined,
    awayScore: formData.get("awayScore") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { matchId, betType, homeScore, awayScore } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return { error: "Матч не знайдено" };
  }
  if (match.kickoff.getTime() <= Date.now()) {
    return { error: "Ставки на цей матч вже закриті" };
  }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    create: {
      userId: session.user.id,
      matchId,
      betType,
      homeScore: betType === "EXACT_SCORE" ? homeScore : null,
      awayScore: betType === "EXACT_SCORE" ? awayScore : null,
    },
    update: {
      betType,
      homeScore: betType === "EXACT_SCORE" ? homeScore : null,
      awayScore: betType === "EXACT_SCORE" ? awayScore : null,
    },
  });

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}

const advancementSchema = z.object({
  matchId: z.string().min(1),
  advancesTeam: z.enum(["HOME", "AWAY"]),
});

export async function submitAdvancementBet(_prevState: { error?: string } | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Спочатку увійдіть в акаунт" };
  }
  if (session.user.isBlocked) {
    return { error: "Ваш акаунт заблоковано адміністратором" };
  }

  const parsed = advancementSchema.safeParse({
    matchId: formData.get("matchId"),
    advancesTeam: formData.get("advancesTeam"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { matchId, advancesTeam } = parsed.data;

  const match = await prisma.match.findUnique({ where: { id: matchId } });
  if (!match) {
    return { error: "Матч не знайдено" };
  }
  if (match.stage === "GROUP_STAGE") {
    return { error: "Ставка на прохід недоступна для групового етапу" };
  }
  if (match.kickoff.getTime() <= Date.now()) {
    return { error: "Ставки на цей матч вже закриті" };
  }

  await prisma.prediction.upsert({
    where: { userId_matchId: { userId: session.user.id, matchId } },
    create: {
      userId: session.user.id,
      matchId,
      betType: advancesTeam === "HOME" ? "HOME_WIN" : "AWAY_WIN",
      advancesTeam,
    },
    update: { advancesTeam },
  });

  revalidatePath(`/matches/${matchId}`);
  return { success: true };
}
