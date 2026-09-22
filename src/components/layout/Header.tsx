"use client";

import { Wallet, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { RetroStreakFlame } from "@/components/retro/RetroStreakFlame";
import { RetroXpBar } from "@/components/retro/RetroXpBar";
import { usePrivacy } from "@/context/PrivacyContext";

interface HeaderProps {
  currentStreak?: number;
  totalXp?: number;
}

export function Header({ currentStreak = 0, totalXp = 0 }: HeaderProps) {
  const { isPrivacyMode, togglePrivacyMode } = usePrivacy();

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

      {/* Header Actions: Privacy Eye & Gamification Stats */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={togglePrivacyMode}
          title={isPrivacyMode ? "Tampilkan nominal uang" : "Sembunyikan nominal uang (Mode Privasi)"}
          aria-label={isPrivacyMode ? "Tampilkan nominal uang" : "Sembunyikan nominal uang"}
          className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all active:scale-95 ${
            isPrivacyMode
              ? "bg-emerald-50 border-emerald-300 text-emerald-600 shadow-2xs"
              : "bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-400 hover:text-slate-600"
          }`}
        >
          {isPrivacyMode ? (
            <EyeOff className="w-3.5 h-3.5 stroke-[2.5]" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
        </button>
        <RetroStreakFlame streak={currentStreak} size="sm" href="/profile" />
        <RetroXpBar totalXp={totalXp} variant="header" href="/profile" />
      </div>
    </header>
  );
}
