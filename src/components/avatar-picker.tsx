"use client";

import { useState } from "react";
import { AVATARS } from "@/lib/avatars";

export function AvatarPicker({ defaultValue }: { defaultValue: number | null }) {
  const [selected, setSelected] = useState<number | null>(defaultValue);

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name="avatarId" value={selected ?? ""} />
      <div className="grid grid-cols-6 gap-2 sm:grid-cols-10">
        {AVATARS.map((avatar) => (
          <button
            key={avatar.id}
            type="button"
            onClick={() => setSelected(avatar.id)}
            aria-label={`Аватар ${avatar.id}`}
            className={`flex h-10 w-10 items-center justify-center rounded-full text-lg transition-transform hover:scale-105 ${avatar.bgClass} ${
              selected === avatar.id ? "ring-2 ring-black ring-offset-2 dark:ring-white dark:ring-offset-black" : ""
            }`}
          >
            {avatar.icon ?? avatar.emoji}
          </button>
        ))}
      </div>
    </div>
  );
}
