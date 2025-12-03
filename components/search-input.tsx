"use client";

import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { useTheme } from "@/app/providers";

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchInput({
  value,
  onChange,
  placeholder = "Search sessions...",
}: SearchInputProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <Input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`pl-8 ${
          isDark
            ? "border-slate-700 bg-slate-900/70 text-slate-100 placeholder:text-slate-500 focus-visible:ring-emerald-500"
            : "border-slate-200 bg-slate-100 text-slate-900 placeholder:text-slate-500 focus-visible:ring-slate-400"
        }`}
      />
    </div>
  );
}
