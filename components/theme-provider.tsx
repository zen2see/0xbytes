"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";

type Theme =
  | "neutral-dark"
  | "ocean-blue-dark"
  | "forest-green-dark"
  | "orange-dark"
  | "violet-dark"
  | "neutral-light" // New light theme
  | "mint-light"    // New light theme
  | "cream-light"   // New light theme
  | "light-blue";   // New light theme

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDarkMode: boolean;
};

const initialState: ThemeProviderState = {
  theme: "neutral-dark",
  setTheme: () => null,
  isDarkMode: true, // Default to true, but will be calculated
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "neutral-dark",
  storageKey = "vite-ui-theme",
  ...props
}: {
  children: ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
}) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window !== "undefined") {
      const storedTheme = localStorage.getItem(storageKey);
      return (storedTheme as Theme) || defaultTheme;
    }
    return defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    // Remove all theme-related classes and 'dark' class
    root.classList.remove(
      "theme-neutral-dark",
      "theme-ocean-blue-dark",
      "theme-forest-green-dark",
      "theme-orange-dark",
      "theme-violet-dark",
      "theme-neutral-light", // New light theme
      "theme-mint-light",    // New light theme
      "theme-cream-light",   // New light theme
      "theme-light-blue",    // New light theme
      "dark"
    );

    const isCurrentThemeDark = theme.includes("-dark");

    if (isCurrentThemeDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }

    if (theme) {
      root.classList.add(`theme-${theme}`);
    } else {
      // If no theme is selected, apply the default theme
      const isDefaultThemeDark = defaultTheme.includes("-dark");
      if (isDefaultThemeDark) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
      root.classList.add(`theme-${defaultTheme}`);
    }
  }, [theme, defaultTheme]);

  const setTheme = (theme: Theme) => {
    localStorage.setItem(storageKey, theme);
    setThemeState(theme);
  };

  const value = {
    theme,
    setTheme,
    isDarkMode: theme.includes("-dark"), // Calculate dynamically
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");
  return context;
};
