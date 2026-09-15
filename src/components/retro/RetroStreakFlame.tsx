"use client";

import { Flame } from "lucide-react";
import Link from "next/link";

interface RetroStreakFlameProps {
  streak: number;
  size?: "sm" | "md" | "lg";
  href?: string;
  showLabel?: boolean;
}

export function RetroStreakFlame({
  streak = 0,
  size = "sm",
  href,
  showLabel = false,
}: RetroStreakFlameProps) {
  const hasStreak = streak > 0;

  const content = (
    <div
      className={`inline-flex items-center gap-1.5 transition-all select-none ${
        size === "sm"
          ? "px-2.5 py-1 rounded-full text-[10px]"
          : size === "md"
          ? "px-3.5 py-1.5 rounded-xl text-xs"
          : "px-4 py-2.5 rounded-2xl text-sm"
      } ${
        hasStreak
          ? "bg-amber-50 border border-amber-300 text-amber-900 shadow-xs hover:border-amber-400"
          : "bg-slate-100 border border-slate-200 text-slate-400"
      }`}
    >
      <div className="relative flex items-center justify-center">
        <Flame
          className={`${
            size === "sm"
              ? "w-3.5 h-3.5"
              : size === "md"
              ? "w-4 h-4"
              : "w-5 h-5"
          } transition-transform duration-200 ${
            hasStreak
              ? "text-amber-500 fill-amber-400 animate-pulse"
              : "text-slate-400 fill-slate-300"
          }`}
        />
      </div>

      <div className="flex items-center gap-1 leading-none">
        <span className="font-pixel font-bold tracking-tight">
          {streak}
        </span>
        {showLabel && (
          <span className="font-semibold text-[11px] text-slate-600 ml-0.5">
            Hari
          </span>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-block focus:outline-none focus:ring-1 focus:ring-amber-400 rounded-full">
        {content}
      </Link>
    );
  }

  return content;
}
