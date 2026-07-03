import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/avatar";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/signin");

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <div className="flex items-center gap-4">
        <UserAvatar name={user.name ?? user.email ?? "Игрок"} avatarId={user.avatarId} size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Профиль</h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
      </div>

      {user.isBlocked && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
          Ваш аккаунт заблокирован администратором. Ставки временно недоступны.
        </p>
      )}

      <ProfileForm name={user.name ?? ""} avatarId={user.avatarId} />
    </div>
  );
}
