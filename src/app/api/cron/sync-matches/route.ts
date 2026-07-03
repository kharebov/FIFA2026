import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fetchWorldCupMatches, fetchGroupStandings } from "@/lib/football-data";
import { scoreMatch } from "@/lib/scoring";

// Pulls the current World Cup schedule/results from football-data.org, upserts
// them into our Match table, and scores predictions for any match that just
// finished. Triggered on a schedule by Vercel Cron (see vercel.json) and
// guarded by CRON_SECRET so it can't be hit by randoms.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const matches = await fetchWorldCupMatches();

  for (const match of matches) {
    await prisma.match.upsert({
      where: { externalId: match.externalId },
      create: { ...match },
      update: { ...match },
    });
  }

  // Group stage may not exist yet this early in the season (or the standings
  // endpoint can lag behind fixtures) — don't let that fail the whole sync.
  let standingsSynced = 0;
  try {
    const standings = await fetchGroupStandings();
    for (const row of standings) {
      await prisma.groupStanding.upsert({
        where: { group_teamName: { group: row.group, teamName: row.teamName } },
        create: { ...row },
        update: { ...row },
      });
    }
    standingsSynced = standings.length;
  } catch (error) {
    console.error("Failed to sync group standings", error);
  }

  // Score off unscored predictions rather than a "just transitioned to FINISHED"
  // check within this request: that made scoring dependent on this exact run
  // completing without errors, so a match could permanently miss scoring if a
  // crash happened between upserting it and reaching the scoring step. This
  // way every run is idempotent and self-healing regardless of prior failures.
  const unscoredMatchIds = await prisma.prediction
    .findMany({
      where: { points: null, match: { status: "FINISHED" } },
      select: { matchId: true },
      distinct: ["matchId"],
    })
    .then((rows) => rows.map((row) => row.matchId));

  for (const matchId of unscoredMatchIds) {
    await scoreMatch(matchId);
  }

  return NextResponse.json({
    synced: matches.length,
    standingsSynced,
    scored: unscoredMatchIds.length,
  });
}
