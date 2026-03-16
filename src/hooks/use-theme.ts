import { useCallback, useEffect, useState } from "react";
import type { ThemeMode } from "@/types";

const THEME_STORAGE_KEY = "algolympus.theme";

function getPreferredTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "dark";
  }

  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "light" || stored === "dark") {
    return stored;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyThemeAttribute(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeMode>(() => getPreferredTheme());

  useEffect(() => {
    applyThemeAttribute(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") {
        return;
      }
      setTheme(event.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => (current === "dark" ? "light" : "dark"));
  }, []);

  return {
    theme,
    toggleTheme,
    setTheme,
  };
}
