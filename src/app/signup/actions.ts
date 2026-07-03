"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/auth";

const signUpSchema = z.object({
  name: z.string().min(1, "Введіть ім'я"),
  email: z.string().email("Некоректний email"),
  password: z.string().min(8, "Пароль має бути не коротшим за 8 символів"),
});

export async function signUp(_prevState: { error?: string } | undefined, formData: FormData) {
  const parsed = signUpSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Користувач з таким email вже зареєстрований" };
  }

  const passwordHash = await bcrypt.hash(password, 12);
  await prisma.user.create({ data: { name, email, passwordHash } });

  await signIn("credentials", { email, password, redirectTo: "/matches" });
}
