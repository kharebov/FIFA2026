import Link from "next/link";
import { auth, signOut } from "@/auth";
import { NavLinks } from "@/components/nav-links";
import { ButtonLink } from "@/components/button";
import { UserAvatar } from "@/components/avatar";

export async function Navbar() {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <header className="sticky top-0 z-10 border-b border-black/10 bg-zinc-50/80 backdrop-blur-sm dark:border-white/10 dark:bg-black/80">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-3">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <BallIcon className="h-7 w-7" />
          <span>ЧМ-2026 Прогнозы</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <NavLinks isAdmin={isAdmin} />
        </nav>
        <div className="flex items-center gap-2 text-sm">
          {session?.user ? (
            <>
              <Link
                href="/profile"
                className="flex items-center gap-2 rounded-full px-2 py-1 hover:bg-black/5 dark:hover:bg-white/10"
              >
                <UserAvatar
                  name={session.user.name ?? session.user.email ?? "Игрок"}
                  avatarId={session.user.avatarId}
                  size={24}
                />
                <span className="hidden sm:inline">{session.user.name ?? session.user.email}</span>
              </Link>
              <form
                action={async () => {
                  "use server";
                  await signOut({ redirectTo: "/" });
                }}
              >
                <button
                  type="submit"
                  className="rounded-full px-3 py-1.5 text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
                >
                  Выйти
                </button>
              </form>
            </>
          ) : (
            <ButtonLink href="/signin">Войти</ButtonLink>
          )}
        </div>
      </div>
    </header>
  );
}

function BallIcon({ className }: { className?: string }) {
  // Original artwork evoking a tournament training ball: white base with
  // color-blocked red/blue/green regions and a dark diagonal band, without
  // copying any official crest, mascot, sponsor mark, or trademarked graphic.
  return (
    <svg viewBox="0 0 32 32" className={className} xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="ball-icon-clip">
          <circle cx="16" cy="16" r="14.5" />
        </clipPath>
      </defs>
      <circle cx="16" cy="16" r="14.5" fill="white" />
      <g clipPath="url(#ball-icon-clip)">
        <path d="M33 0C20-1 12 8 15 17 18 26 27 29 33 32Z" fill="#2f6fed" />
        <path d="M-3 15C2 7 9 5 14 11 13 20 6 27-3 30Z" fill="#e0342a" />
        <path d="M3 29C8 23 18 23 24 29L24 34 3 34Z" fill="#2e9e4e" />
        <path
          d="M-1 6C10 10 20 20 31 24"
          stroke="#12224d"
          strokeWidth="3.2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      <circle cx="16" cy="16" r="14.5" fill="none" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1" />
    </svg>
  );
}
