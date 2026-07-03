import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  await prisma.match.createMany({
    data: [
      {
        externalId: 900001,
        stage: "GROUP_STAGE",
        group: "Group A",
        matchday: 1,
        kickoff: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3),
        homeTeam: "Mexico",
        awayTeam: "Canada",
        status: "SCHEDULED",
      },
      {
        externalId: 900002,
        stage: "GROUP_STAGE",
        group: "Group B",
        matchday: 1,
        kickoff: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4),
        homeTeam: "USA",
        awayTeam: "Wales",
        status: "SCHEDULED",
      },
      {
        externalId: 900003,
        stage: "GROUP_STAGE",
        group: "Group A",
        matchday: 1,
        kickoff: new Date(Date.now() - 1000 * 60 * 60 * 24),
        homeTeam: "Argentina",
        awayTeam: "Brazil",
        status: "FINISHED",
        homeScore: 2,
        awayScore: 1,
      },
    ],
    skipDuplicates: true,
  });

  console.log("Seeded matches");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => process.exit(0));
