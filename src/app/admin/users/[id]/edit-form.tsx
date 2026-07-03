"use client";

import { useActionState } from "react";
import { adminUpdateUser } from "../../actions";
import { AvatarPicker } from "@/components/avatar-picker";
import { Button } from "@/components/button";
import { Role } from "@/generated/prisma/client";

export function AdminEditForm({
  userId,
  name,
  avatarId,
  role,
  isBlocked,
  isSelf,
}: {
  userId: string;
  name: string;
  avatarId: number | null;
  role: Role;
  isBlocked: boolean;
  isSelf: boolean;
}) {
  const [state, formAction, pending] = useActionState(adminUpdateUser, undefined);

  return (
    <form action={formAction} className="flex flex-col gap-6">
      <input type="hidden" name="userId" value={userId} />

      <label className="flex flex-col gap-1 text-sm">
        Имя
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

      <label className="flex flex-col gap-1 text-sm">
        Роль
        <select
          name="role"
          defaultValue={role}
          className="max-w-xs rounded-md border border-black/10 px-3 py-2 dark:border-white/20 dark:bg-transparent"
        >
          <option value="USER">Игрок</option>
          <option value="ADMIN">Админ</option>
        </select>
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="isBlocked" defaultChecked={isBlocked} />
        Заблокирован
      </label>

      {isSelf && (
        <p className="text-xs text-zinc-500">
          Себе нельзя менять роль или ставить блокировку — эти поля не сохранятся.
        </p>
      )}

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state?.success && <p className="text-sm text-green-600">Сохранено</p>}

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Сохраняем..." : "Сохранить"}
      </Button>
    </form>
  );
}
