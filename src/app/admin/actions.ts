"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AVATARS } from "@/lib/avatars";

const VALID_AVATAR_IDS = AVATARS.map((avatar) => avatar.id);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  return session.user;
}

export async function toggleBlock(userId: string) {
  const admin = await requireAdmin();
  if (userId === admin.id) {
    throw new Error("Не можна заблокувати самого себе");
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });
  await prisma.user.update({ where: { id: userId }, data: { isBlocked: !user.isBlocked } });
  revalidatePath("/admin/users");
}

const editSchema = z.object({
  userId: z.string().min(1),
  name: z.string().trim().min(1, "Введіть ім'я").max(60, "Занадто довге ім'я"),
  avatarId: z.coerce
    .number()
    .int()
    .refine((id) => VALID_AVATAR_IDS.includes(id), { message: "Невідомий аватар" })
    .nullish(),
  role: z.enum(["USER", "ADMIN"]),
  isBlocked: z.coerce.boolean(),
});

export async function adminUpdateUser(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const admin = await requireAdmin();

  const rawAvatarId = formData.get("avatarId");
  const parsed = editSchema.safeParse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    avatarId: rawAvatarId || undefined,
    role: formData.get("role"),
    isBlocked: formData.get("isBlocked") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { userId, name, avatarId, role, isBlocked } = parsed.data;

  if (userId === admin.id && (role !== admin.role || isBlocked)) {
    return { error: "Не можна змінювати свою роль або блокувати себе" };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { name, avatarId: avatarId ?? null, role, isBlocked },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  return { success: true };
}
