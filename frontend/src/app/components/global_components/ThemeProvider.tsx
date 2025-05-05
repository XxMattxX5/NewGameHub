"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { Theme } from "@/app/types";
import { useCookies } from "next-client-cookies";

interface ThemeContextType {
  theme: Theme | null;
  toggleTheme: (selectedTheme?: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const cookies = useCookies();
  const [theme, setTheme] = useState<Theme | null>(null);

  const setThemeCookie = (value: Theme) => {
    cookies.set("theme", value);
    document.cookie = `theme=${value}; path=/; max-age=31536000`; // 1 year
  };

  // Checks if theme is stored in local storage else uses the prefer theme on user's computer
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as Theme | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
      setThemeCookie(savedTheme);
    } else {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setTheme(prefersDark ? "dark" : "light");
      document.documentElement.classList.toggle("dark", prefersDark);
    }
  }, []);

  const toggleTheme = (selectedTheme?: Theme) => {
    const newTheme = selectedTheme || (theme === "dark" ? "light" : "dark");
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    setThemeCookie(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
