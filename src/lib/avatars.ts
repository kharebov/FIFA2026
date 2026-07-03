const BG_PALETTE = [
  "bg-red-100 dark:bg-red-900/40",
  "bg-orange-100 dark:bg-orange-900/40",
  "bg-amber-100 dark:bg-amber-900/40",
  "bg-emerald-100 dark:bg-emerald-900/40",
  "bg-teal-100 dark:bg-teal-900/40",
  "bg-blue-100 dark:bg-blue-900/40",
  "bg-indigo-100 dark:bg-indigo-900/40",
  "bg-purple-100 dark:bg-purple-900/40",
  "bg-pink-100 dark:bg-pink-900/40",
];

const EMOJIS = [
  "⚽",
  "🏆",
  "🥇",
  "🎯",
  "🔥",
  "⭐",
  "🦁",
  "🐯",
  "🦅",
  "🐬",
  "🦈",
  "🐢",
  "🐸",
  "🦉",
  "🦊",
  "🐺",
  "🐻",
  "🐼",
  "🐨",
  "🦄",
  "🐲",
  "🥷",
  "🤖",
  "👽",
  "🎃",
  "🍀",
  "💎",
  "🚀",
  "🎮",
  "🍕",
];

export interface PresetAvatar {
  id: number;
  emoji: string;
  bgClass: string;
}

export const AVATARS: PresetAvatar[] = EMOJIS.map((emoji, index) => ({
  id: index + 1,
  emoji,
  bgClass: BG_PALETTE[index % BG_PALETTE.length],
}));

export function findAvatar(avatarId: number | null | undefined): PresetAvatar | null {
  if (!avatarId) return null;
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? null;
}
