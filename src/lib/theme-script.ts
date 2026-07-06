// Runs synchronously before first paint (see layout.tsx <head>) so the
// correct theme applies immediately — no flash of the wrong theme, and no
// React hydration mismatch since this never touches React-rendered output.
export const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("theme");
    var isDark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", isDark);
  } catch (e) {}
})();
`;
