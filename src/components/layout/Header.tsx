"use client";

import { Wallet } from "lucide-react";
import Link from "next/link";
import { RetroStreakFlame } from "@/components/retro/RetroStreakFlame";
import { RetroXpBar } from "@/components/retro/RetroXpBar";

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
            Cashflow
          </span>
        </div>
      </Link>

      {/* Gamification Stats: Streak Flame & XP Badge */}
      <div className="flex items-center gap-2">
        <RetroStreakFlame streak={currentStreak} size="sm" href="/profile" />
        <RetroXpBar totalXp={totalXp} variant="header" href="/profile" />
      </div>
    </header>
  );
}
