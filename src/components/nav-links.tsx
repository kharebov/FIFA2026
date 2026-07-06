"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const BASE_LINKS = [
  { href: "/matches", label: "Матчі" },
  { href: "/standings", label: "Турнірна таблиця" },
  { href: "/leaderboard", label: "Рейтинг" },
];

export function NavLinks({ isLoggedIn = false, isAdmin = false }: { isLoggedIn?: boolean; isAdmin?: boolean }) {
  const pathname = usePathname();
  const links = isLoggedIn
    ? [BASE_LINKS[0], { href: "/my-predictions", label: "Мій прогноз" }, ...BASE_LINKS.slice(1)]
    : BASE_LINKS;
  const allLinks = isAdmin ? [...links, { href: "/admin/users", label: "Адмін" }] : links;

  return (
    <>
      {allLinks.map((link) => {
        const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-full px-3 py-1.5 transition-colors ${
              active
                ? "bg-black text-white dark:bg-white dark:text-black"
                : "text-zinc-600 hover:bg-black/5 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-white/10 dark:hover:text-zinc-100"
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </>
  );
}
