"use client";

import { Flame, Wallet } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  currentStreak?: number;
  totalXp?: number;
}

export function Header({ currentStreak = 0, totalXp = 0 }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3 flex items-center justify-between">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white shadow-retro-sm transition-transform group-hover:scale-105">
          <Wallet className="w-4 h-4" />
        </div>
        <div>
          <span className="font-bold text-sm tracking-tight text-slate-900 block leading-tight">
            Story Finance
          </span>
          <span className="text-[10px] text-slate-500 font-medium block leading-tight">
            Cashflow & Self-Reward
          </span>
        </div>
      </Link>

      {/* Gamification Stats: Streak Flame & XP Badge */}
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200/60 text-amber-700 shadow-sm">
          <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
          <span className="font-pixel text-[10px]">{currentStreak}</span>
        </div>

        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 shadow-sm">
          <span className="text-[10px] font-bold">XP</span>
          <span className="font-pixel text-[10px]">{totalXp}</span>
        </div>
      </div>
    </header>
  );
}
