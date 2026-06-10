import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Theme = "default" | "dark" | "light";
const STORAGE_KEY = "medharank-theme";

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme", theme);
}

function readStoredTheme(): Theme {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null;
  return stored === "dark" || stored === "light" || stored === "default" ? stored : "default";
}

type ThemeContextValue = { theme: Theme; setTheme: (t: Theme) => void };
const ThemeContext = createContext<ThemeContextValue>({ theme: "default", setTheme: () => {} });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("default");

  useEffect(() => {
    const initial = readStoredTheme();
    setThemeState(initial);
    applyTheme(initial);
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    applyTheme(t);
    try {
      window.localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* ignore */
    }
  };

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
