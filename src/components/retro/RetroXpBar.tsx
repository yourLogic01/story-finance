"use client";

import { getLevelInfo } from "@/lib/gamification/xp";
import Link from "next/link";

interface RetroXpBarProps {
  totalXp: number;
  level?: number;
  variant?: "header" | "card";
  href?: string;
}

export function RetroXpBar({
  totalXp = 0,
  level: propLevel,
  variant = "header",
  href,
}: RetroXpBarProps) {
  const levelInfo = getLevelInfo(totalXp);
  const displayLevel = propLevel || levelInfo.level;

  if (variant === "header") {
    const headerPill = (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 shadow-xs hover:border-emerald-300 transition-all select-none">
        <span className="text-[10px] font-pixel text-emerald-600 bg-emerald-100/80 px-1.5 py-0.5 rounded">
          Lv.{displayLevel}
        </span>
        <div className="flex items-center gap-1">
          <span className="text-[9px] font-bold text-slate-400">XP</span>
          <span className="font-pixel text-[10px] text-slate-800">
            {totalXp}
          </span>
        </div>
      </div>
    );

    if (href) {
      return (
        <Link
          href={href}
          className="inline-block focus:outline-none focus:ring-1 focus:ring-emerald-400 rounded-full"
        >
          {headerPill}
        </Link>
      );
    }

    return headerPill;
  }

  // Segmented 8-bit block bar (10 segments)
  const totalBlocks = 10;
  const filledBlocks = Math.round((levelInfo.progressPercent / 100) * totalBlocks);

  return (
    <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
      {/* Level Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-pixel text-xs shadow-xs">
            {displayLevel}
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider">
              Level {displayLevel}
            </span>
            <h4 className="text-xs font-bold text-slate-800">
              {levelInfo.title}
            </h4>
          </div>
        </div>

        <div className="text-right">
          <span className="font-pixel text-xs font-bold text-emerald-700 block">
            {totalXp} XP
          </span>
          <span className="text-[10px] text-slate-400">
            {levelInfo.isMaxLevel
              ? "Max Level"
              : `${levelInfo.xpNeededForNextTier - levelInfo.xpInCurrentTier} XP ke Lv.${displayLevel + 1}`}
          </span>
        </div>
      </div>

      {/* 8-bit Segmented Progress Blocks */}
      <div className="space-y-1">
        <div className="grid grid-cols-10 gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
          {Array.from({ length: totalBlocks }).map((_, index) => {
            const isFilled = index < filledBlocks;
            return (
              <div
                key={index}
                className={`h-2.5 rounded-sm transition-all duration-300 ${
                  isFilled
                    ? "bg-emerald-500 shadow-xs"
                    : "bg-slate-200/80"
                }`}
              />
            );
          })}
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
          <span>{levelInfo.currentTierBaseXp} XP</span>
          <span className="font-pixel font-bold text-slate-600">
            {levelInfo.progressPercent}%
          </span>
          <span>{levelInfo.isMaxLevel ? "MAX" : `${levelInfo.nextTierXp} XP`}</span>
        </div>
      </div>
    </div>
  );
}
