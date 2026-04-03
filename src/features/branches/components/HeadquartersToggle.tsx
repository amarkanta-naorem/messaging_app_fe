"use client";

import { Sparkles } from "lucide-react";

interface HeadquartersToggleProps {
  isHeadquarters: boolean;
  onToggle: () => void;
}

export function HeadquartersToggle({ isHeadquarters, onToggle }: HeadquartersToggleProps) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${isHeadquarters ? "border-(--accent-primary)/30 bg-(--accent-primary)/5 dark:bg-(--accent-primary)/10" : "border-(--border-primary) bg-(--bg-secondary)/30 hover:border-(--border-secondary)"}`} onClick={onToggle}>
      <div className={`relative w-11 h-6 rounded-full transition-colors duration-200 shrink-0 ${isHeadquarters ? "bg-(--accent-primary)" : "bg-(--bg-tertiary) border border-(--border-primary)"}`}>
        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-200 ${isHeadquarters ? "translate-x-6" : "translate-x-1"}`}/>
      </div>
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-(--accent-primary)/10">
          <Sparkles className="h-4 w-4 text-(--accent-primary)" />
        </div>
        <div>
          <label className="text-sm font-semibold text-(--text-primary) cursor-pointer">Headquarters Branch</label>
          <p className="text-xs text-(--text-muted) mt-0.5">{isHeadquarters ? "This is the main headquarters location" : "Set as the primary headquarters location"}</p>
        </div>
      </div>
    </div>
  );
}