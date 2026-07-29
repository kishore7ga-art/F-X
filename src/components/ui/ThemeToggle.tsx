"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle({
  className = "",
  onChange,
}: {
  className?: string;
  onChange?: (isDark: boolean) => void;
}) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check initial document dark mode state or localStorage
    const savedTheme = localStorage.getItem("xite-theme-mode");
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const initialDark = savedTheme === "dark" || (!savedTheme && systemDark);

    setIsDark(initialDark);
    if (initialDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  function toggle() {
    const nextDark = !isDark;
    setIsDark(nextDark);
    localStorage.setItem("xite-theme-mode", nextDark ? "dark" : "light");

    if (nextDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }

    if (onChange) {
      onChange(nextDark);
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200/20 bg-white/10 text-slate-200 transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95 shadow-sm cursor-pointer ${className}`}
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-100 transition-transform duration-300 rotate-0 hover:-rotate-12" />
      )}
    </button>
  );
}
