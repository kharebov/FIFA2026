"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signUp } from "./actions";
import { Button } from "@/components/button";

export default function SignUpPage() {
  const [state, formAction, pending] = useActionState(signUp, undefined);

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6">
      <h1 className="text-2xl font-semibold tracking-tight">Регистрация</h1>
      <form action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Имя
          <input
            name="name"
            type="text"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Пароль
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="rounded-md border border-black/10 px-3 py-2 dark:border-white/20 dark:bg-transparent"
          />
        </label>
        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={pending}>
          {pending ? "Создаём аккаунт..." : "Зарегистрироваться"}
        </Button>
      </form>
      <p className="text-sm text-zinc-500">
        Уже есть аккаунт?{" "}
        <Link href="/signin" className="underline">
          Войти
        </Link>
      </p>
    </div>
  );
}
