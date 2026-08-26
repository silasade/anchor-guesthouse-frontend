import { useCallback, useSyncExternalStore } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

const STORAGE_KEY = "stayhub_theme";

const listeners = new Set<() => void>();

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "system";
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "light" || stored === "dark" || stored === "system"
    ? stored
    : "system";
}

function prefersDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function resolveTheme(theme: Theme): ResolvedTheme {
  if (theme === "system") return prefersDark() ? "dark" : "light";
  return theme;
}

/** Applies the resolved theme to `<html>`, which is what the CSS tokens key off. */
export function applyTheme(theme: Theme): void {
  const resolved = resolveTheme(theme);
  document.documentElement.classList.toggle("dark", resolved === "dark");
  document.documentElement.style.colorScheme = resolved;
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const onSystemChange = () => {
    if (readStoredTheme() === "system") {
      applyTheme("system");
      listeners.forEach((notify) => notify());
    }
  };
  media.addEventListener("change", onSystemChange);

  return () => {
    listeners.delete(listener);
    media.removeEventListener("change", onSystemChange);
  };
}

/**
 * Reads and writes the colour scheme. Kept dependency-free so the token layer in
 * `index.css` stays the single source of truth for what each theme looks like.
 */
export function useTheme() {
  const theme = useSyncExternalStore(subscribe, readStoredTheme, () => "system" as Theme);

  const setTheme = useCallback((next: Theme) => {
    window.localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
    listeners.forEach((notify) => notify());
  }, []);

  const resolvedTheme = resolveTheme(theme);

  const toggleTheme = useCallback(() => {
    setTheme(resolveTheme(readStoredTheme()) === "dark" ? "light" : "dark");
  }, [setTheme]);

  return { theme, resolvedTheme, setTheme, toggleTheme };
}

/** Runs before React mounts so the first paint already has the right theme. */
export function initializeTheme(): void {
  applyTheme(readStoredTheme());
}
