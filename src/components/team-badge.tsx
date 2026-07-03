import { teamFlag } from "@/lib/flags";

export function TeamBadge({
  name,
  crestUrl,
  reverse = false,
  size = 20,
}: {
  name: string;
  crestUrl?: string | null;
  reverse?: boolean;
  size?: number;
}) {
  const flag = teamFlag(name);
  const isTbd = name === "TBD";

  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${reverse ? "flex-row-reverse" : ""}`}>
      <span className="flex shrink-0 items-center gap-1">
        {crestUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={crestUrl} alt="" width={size} height={size} className="object-contain" style={{ width: size, height: size }} />
        ) : isTbd ? (
          <span
            className="flex items-center justify-center rounded-full border border-dashed border-black/20 text-[10px] text-zinc-400 dark:border-white/20"
            style={{ width: size, height: size }}
          >
            ?
          </span>
        ) : null}
        {flag && <span style={{ fontSize: size * 0.7 }}>{flag}</span>}
      </span>
      <span className={`truncate ${isTbd ? "italic text-zinc-400" : ""}`}>{name}</span>
    </span>
  );
}
