const MEDAL_CLASSES: Record<number, string> = {
  1: "bg-amber-400 text-amber-950",
  2: "bg-zinc-300 text-zinc-800",
  3: "bg-orange-300 text-orange-950",
};

export function RankBadge({ position, size = 28 }: { position: number; size?: number }) {
  const medalClass = MEDAL_CLASSES[position];

  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full text-xs font-bold ${
        medalClass ?? "bg-black/5 text-zinc-600 dark:bg-white/10 dark:text-zinc-300"
      }`}
      style={{ width: size, height: size, fontSize: size * 0.42 }}
    >
      {position}
    </span>
  );
}
