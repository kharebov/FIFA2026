"use client";

import { useSyncExternalStore } from "react";

function subscribe(onStoreChange: () => void) {
  // toggle() below dispatches this after mutating the class, since the
  // classList itself has no native change event to listen for.
  window.addEventListener("theme-toggle", onStoreChange);
  return () => window.removeEventListener("theme-toggle", onStoreChange);
}

function getSnapshot(): boolean {
  return document.documentElement.classList.contains("dark");
}

function getServerSnapshot(): boolean | null {
  // Unknown until the bootstrap script (see theme-script.ts) has run on the
  // client — render nothing rather than guessing and risking a flash.
  return null;
}

export function ThemeToggle() {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  function toggle() {
    const next = !isDark;
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
    // classList mutated above; nothing subscribes, so force a read on next render.
    window.dispatchEvent(new Event("theme-toggle"));
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? "Увімкнути світлу тему" : "Увімкнути темну тему"}
      title={isDark ? "Світла тема" : "Темна тема"}
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-600 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/10"
    >
      {isDark === null ? null : isDark ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4.5" />
      <path
        strokeLinecap="round"
        d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor">
      <path d="M20.5 14.6A8.5 8.5 0 1 1 9.4 3.5a7 7 0 0 0 11.1 11.1Z" />
    </svg>
  );
}
