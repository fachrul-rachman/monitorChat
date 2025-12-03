"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "@/app/providers";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      size="icon"
      variant="ghost"
      aria-label="Toggle color mode"
      onClick={toggleTheme}
      className="h-9 w-9 rounded-2xl border border-slate-700/60 bg-slate-900/70 text-slate-100 shadow-sm shadow-slate-950/40 data-[theme=light]:border-slate-200 data-[theme=light]:bg-white/80 data-[theme=light]:text-slate-800"
    >
      {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}

