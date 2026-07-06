import type { ReactNode } from "react";

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
  /** Custom artwork rendered instead of the emoji, e.g. for a look plain emoji fonts can't give. */
  icon?: ReactNode;
  bgClass: string;
}

// Emoji-based avatars first (ids 1..N). Anything added later must be
// appended after this, never inserted earlier — avatarId is a stored array
// index, so shifting it would silently reassign everyone's already-chosen
// avatar to a different picture.
const EMOJI_AVATARS: PresetAvatar[] = EMOJIS.map((emoji, index) => ({
  id: index + 1,
  emoji,
  bgClass: BG_PALETTE[index % BG_PALETTE.length],
}));

const CUSTOM_AVATARS: PresetAvatar[] = [
  {
    id: EMOJI_AVATARS.length + 1,
    emoji: "🏍️",
    icon: <BikerIcon />,
    bgClass: BG_PALETTE[EMOJI_AVATARS.length % BG_PALETTE.length],
  },
];

export const AVATARS: PresetAvatar[] = [...EMOJI_AVATARS, ...CUSTOM_AVATARS];

export function findAvatar(avatarId: number | null | undefined): PresetAvatar | null {
  if (!avatarId) return null;
  return AVATARS.find((avatar) => avatar.id === avatarId) ?? null;
}

/** A bold, solid-black chopper silhouette — a deliberately rougher look than the stock emoji. */
function BikerIcon() {
  return (
    <svg viewBox="0 0 70 44" className="h-[65%] w-[65%]" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Punches the hub hole through to whatever sits behind the icon,
            instead of hardcoding a fill that would only match one background. */}
        <mask id="biker-wheel-mask">
          <rect width="70" height="44" fill="white" />
          <circle cx="15" cy="32" r="4" fill="black" />
          <circle cx="55" cy="32" r="4" fill="black" />
        </mask>
      </defs>
      <g mask="url(#biker-wheel-mask)">
        <circle cx="15" cy="32" r="10" fill="#000" />
        <circle cx="55" cy="32" r="10" fill="#000" />
      </g>
      <path
        d="M6 30 L15 30 L19 21 Q28 12 38 18 L45 15 L52 22 L55 22 L58 30 L52 30 Q44 26 34 26 L21 26 Q17 30 15 30 Z"
        fill="#000"
      />
      <path d="M45 15 L49 4" stroke="#000" strokeWidth="4.5" strokeLinecap="round" fill="none" />
      <rect x="0" y="28.5" width="9" height="4.5" rx="2" fill="#000" />
    </svg>
  );
}
