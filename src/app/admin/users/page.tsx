import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/avatar";
import { toggleBlock } from "../actions";

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") notFound();

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      avatarId: true,
      role: true,
      isBlocked: true,
      predictions: { select: { points: true, advancementPoints: true } },
    },
  });

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold tracking-tight">Користувачі</h1>
      <div className="overflow-x-auto rounded-lg border border-black/10 dark:border-white/10">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="bg-black/[.02] text-left text-xs uppercase text-zinc-500 dark:bg-white/[.03]">
            <tr>
              <th className="px-4 py-2 font-medium">Гравець</th>
              <th className="px-4 py-2 font-medium">Роль</th>
              <th className="px-4 py-2 font-medium">Статус</th>
              <th className="px-4 py-2 text-right font-medium">Очки</th>
              <th className="px-4 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-black/10 dark:divide-white/10">
            {users.map((user) => {
              const displayName = user.name ?? user.email ?? "Гравець";
              const totalPoints = user.predictions.reduce(
                (sum, p) => sum + (p.points ?? 0) + (p.advancementPoints ?? 0),
                0,
              );
              const isSelf = user.id === session.user.id;

              return (
                <tr key={user.id}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/users/${user.id}`} className="flex items-center gap-2 font-medium hover:underline">
                      <UserAvatar name={displayName} avatarId={user.avatarId} size={24} />
                      {displayName}
                    </Link>
                    <div className="text-xs text-zinc-500">{user.email}</div>
                  </td>
                  <td className="px-4 py-3 text-zinc-500">{user.role === "ADMIN" ? "Адмін" : "Гравець"}</td>
                  <td className="px-4 py-3">
                    {user.isBlocked ? (
                      <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/40 dark:text-red-300">
                        Заблокований
                      </span>
                    ) : (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                        Активний
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold">{totalPoints}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={toggleBlock.bind(null, user.id)}>
                      <button
                        type="submit"
                        disabled={isSelf}
                        className="rounded-full border border-black/10 px-3 py-1 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-40 dark:border-white/20"
                      >
                        {user.isBlocked ? "Розблокувати" : "Заблокувати"}
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
