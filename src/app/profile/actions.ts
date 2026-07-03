"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AVATARS } from "@/lib/avatars";

const VALID_AVATAR_IDS = AVATARS.map((avatar) => avatar.id);

const profileSchema = z.object({
  name: z.string().trim().min(1, "Введите имя").max(60, "Слишком длинное имя"),
  avatarId: z.coerce.number().int().refine((id) => VALID_AVATAR_IDS.includes(id), {
    message: "Неизвестный аватар",
  }),
});

export async function updateOwnProfile(_prevState: { error?: string; success?: boolean } | undefined, formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Сначала войдите в аккаунт" };
  }

  const rawAvatarId = formData.get("avatarId");
  const parsed = profileSchema.safeParse({
    name: formData.get("name"),
    avatarId: rawAvatarId || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { name: parsed.data.name, avatarId: parsed.data.avatarId },
  });

  revalidatePath("/profile");
  return { success: true };
}
