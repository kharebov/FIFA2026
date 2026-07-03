import { findAvatar } from "@/lib/avatars";

const PALETTE = [
  "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
  "bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
];

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

function paletteIndex(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash % PALETTE.length;
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-semibold ${PALETTE[paletteIndex(name)]}`}
      style={{ width: size, height: size, fontSize: size * 0.4 }}
    >
      {initialsOf(name)}
    </span>
  );
}

/** Renders the user's chosen preset avatar, falling back to name initials. */
export function UserAvatar({
  name,
  avatarId,
  size = 32,
}: {
  name: string;
  avatarId?: number | null;
  size?: number;
}) {
  const preset = findAvatar(avatarId);
  if (!preset) return <Avatar name={name} size={size} />;

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full ${preset.bgClass}`}
      style={{ width: size, height: size, fontSize: size * 0.55 }}
    >
      {preset.emoji}
    </span>
  );
}
