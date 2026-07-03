"use client";

import { useActionState } from "react";
import { updateOwnProfile } from "./actions";
import { AvatarPicker } from "@/components/avatar-picker";
import { Button } from "@/components/button";

export function ProfileForm({ name, avatarId }: { name: string; avatarId: number | null }) {
  const [state, formAction, pending] = useActionState(updateOwnProfile, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <label className="flex flex-col gap-1 text-sm">
        Ім&apos;я
        <input
          name="name"
          type="text"
          required
          maxLength={60}
          defaultValue={name}
          className="max-w-sm rounded-md border border-black/10 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        />
      </label>

      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium">Аватар</span>
        <AvatarPicker defaultValue={avatarId ?? 1} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Профіль збережено</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Зберігаємо..." : "Зберегти"}
      </Button>
    </form>
  );
}
