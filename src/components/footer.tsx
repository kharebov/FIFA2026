import Link from "next/link";

export function Footer() {
  const year = "2026";

  return (
    <footer className="border-t border-black/10 dark:border-white/10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-8 text-sm text-zinc-500 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Прогнози ЧС-2026</span>
          <span>
            Дані про матчі та турнірну таблицю надані{" "}
            <a
              href="https://www.football-data.org/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              football-data.org
            </a>
            .
          </span>
        </div>
        <nav className="flex gap-4">
          <Link href="/matches" className="hover:underline">
            Матчі
          </Link>
          <Link href="/standings" className="hover:underline">
            Турнірна таблиця
          </Link>
          <Link href="/leaderboard" className="hover:underline">
            Рейтинг
          </Link>
        </nav>
        <span>© {year}</span>
      </div>
    </footer>
  );
}
