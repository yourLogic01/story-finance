"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import { RetroStreakFlame } from "@/components/retro/RetroStreakFlame";
import { RetroXpBar } from "@/components/retro/RetroXpBar";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { GamificationProfileResponse } from "@/app/actions/gamification";
import { Category, Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  Trophy,
  Flame,
  Zap,
  Receipt,
  LogOut,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface ProfileViewProps {
  userProfile: Profile | null;
  userEmail: string;
  gamification: GamificationProfileResponse | null;
  totalTransactions: number;
  categories: Category[];
}

export function ProfileView({
  userProfile,
  userEmail,
  gamification,
  totalTransactions,
  categories,
}: ProfileViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const displayName =
    userProfile?.display_name || userEmail.split("@")[0] || "Pencatat Bijak";

  const handleConfirmLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const currentStreak = gamification?.currentStreak ?? 0;
  const longestStreak = gamification?.longestStreak ?? 0;
  const totalXp = gamification?.totalXp ?? 0;
  const currentLevel = gamification?.currentLevel ?? 1;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50/50">
      {/* Header */}
      <Header currentStreak={currentStreak} totalXp={totalXp} />

      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-24">
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-retro-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">
                {displayName}
              </h2>
              <span className="text-xs text-slate-400 truncate block mt-0.5">
                {userEmail}
              </span>
              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-pixel text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span>Lv.{currentLevel}</span>
                <span>•</span>
                <span>{gamification?.levelTitle || "Pemula Hemat"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Stats Grid (2x2) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Streak Aktif */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Streak Aktif
              </span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="pt-0.5">
              <RetroStreakFlame streak={currentStreak} size="md" showLabel />
            </div>
          </div>

          {/* 2. Rekor Streak */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Rekor Terbaik
              </span>
              <Trophy className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-bold font-pixel text-slate-900">
                {longestStreak}
              </span>
              <span className="text-xs text-slate-500 font-medium">Hari</span>
            </div>
          </div>

          {/* 3. Total XP */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Total XP
              </span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-bold font-pixel text-slate-900">
                {totalXp}
              </span>
              <span className="text-xs text-slate-500 font-medium">XP</span>
            </div>
          </div>

          {/* 4. Total Transaksi */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Transaksi Dicatat
              </span>
              <Receipt className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-bold font-pixel text-slate-900">
                {totalTransactions}
              </span>
              <span className="text-xs text-slate-500 font-medium">Log</span>
            </div>
          </div>
        </div>

        {/* 8-bit XP Progress Bar Section */}
        <RetroXpBar totalXp={totalXp} level={currentLevel} variant="card" />

        {/* Badges Grid Section */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <BadgeGrid badges={gamification?.badges || []} />
        </div>

        {/* Logout Section */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </main>

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Keluar dari Akun?"
        description="Kamu akan keluar dari sesi aplikasi Story Finance di perangkat ini."
        confirmText="Keluar"
        cancelText="Batal"
        variant="danger"
      />

      {/* Quick Add Modal */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
        categories={categories}
        onSuccess={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
    </div>
  );
}
