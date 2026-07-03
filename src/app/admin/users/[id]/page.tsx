import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UserAvatar } from "@/components/avatar";
import { AdminEditForm } from "./edit-form";

export default async function AdminUserEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") notFound();

  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) notFound();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-8">
      <div className="flex items-center gap-4">
        <UserAvatar name={user.name ?? user.email ?? "Гравець"} avatarId={user.avatarId} size={56} />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{user.name ?? "Без імені"}</h1>
          <p className="text-sm text-zinc-500">{user.email}</p>
        </div>
      </div>

      <AdminEditForm
        userId={user.id}
        name={user.name ?? ""}
        avatarId={user.avatarId}
        role={user.role}
        isBlocked={user.isBlocked}
        isSelf={user.id === session.user.id}
      />
    </div>
  );
}
