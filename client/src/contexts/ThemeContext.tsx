import React, { createContext, useContext, useEffect, useState } from "react";

type ThemeMode = "light" | "dark" | "system";
type ActualTheme = "light" | "dark";

interface ThemeContextType {
  theme: ThemeMode;
  actualTheme: ActualTheme;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  switchable?: boolean;
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  switchable = true,
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (switchable) {
      const stored = localStorage.getItem("theme");
      return (stored as ThemeMode) || defaultTheme;
    }
    return defaultTheme;
  });

  const [actualTheme, setActualTheme] = useState<ActualTheme>("light");

  // تحديد الوضع الفعلي بناءً على إعدادات النظام
  useEffect(() => {
    const updateActualTheme = () => {
      if (theme === "system") {
        const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        setActualTheme(systemPrefersDark ? "dark" : "light");
      } else {
        setActualTheme(theme as ActualTheme);
      }
    };

    updateActualTheme();

    // الاستماع لتغييرات إعدادات النظام
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (theme === "system") {
        updateActualTheme();
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme]);

  // تطبيق الوضع على العنصر الجذر
  useEffect(() => {
    const root = document.documentElement;
    if (actualTheme === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }

    if (switchable) {
      localStorage.setItem("theme", theme);
    }
  }, [actualTheme, theme, switchable]);

  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    const newTheme = actualTheme === "light" ? "dark" : "light";
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, actualTheme, toggleTheme, setTheme, switchable }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
