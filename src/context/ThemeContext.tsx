import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: "light" | "dark";
  setTheme: (theme: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const STORAGE_KEY = "star-costos.theme";

const getSystemTheme = () => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const raw = typeof window === "undefined" ? null : window.localStorage.getItem(STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
    return "system";
  });
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(getSystemTheme());

  const resolvedTheme: "light" | "dark" = theme === "system" ? systemTheme : theme;

  useEffect(() => {
    const mq = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mq) return;
    const handler = () => setSystemTheme(mq.matches ? "dark" : "light");
    handler();
    mq.addEventListener?.("change", handler);
    return () => mq.removeEventListener?.("change", handler);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
  }, [theme, resolvedTheme]);

  const setTheme = (next: ThemeMode) => setThemeState(next);
  const toggle = () => setThemeState((prev) => (prev === "dark" ? "light" : "dark"));

  const value = useMemo(() => ({ theme, resolvedTheme, setTheme, toggle }), [theme, resolvedTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};

