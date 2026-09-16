"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  LEVEL_TIERS,
  TIER_GROUPS,
  getTierGroup,
  getLevelInfo,
} from "@/lib/gamification/xp";
import { cn } from "@/lib/utils";
import { Lock, Check, Sparkles } from "lucide-react";

interface LevelTiersModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLevel: number;
  totalXp: number;
  displayName?: string;
}

export function LevelTiersModal({
  isOpen,
  onClose,
  currentLevel,
  totalXp,
  displayName = "Pencatat Bijak",
}: LevelTiersModalProps) {
  const currentTier = getTierGroup(currentLevel);
  const levelInfo = getLevelInfo(totalXp);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md w-[calc(100%-2rem)] p-0 overflow-hidden border-slate-200/90 shadow-2xl rounded-3xl max-h-[85vh] flex flex-col bg-slate-50">
        {/* Header Section with Retro Gradient & Pixel Accent */}
        <div className="p-5 bg-white border-b border-slate-200/80 shrink-0 space-y-3">
          <DialogHeader className="text-left space-y-1">
            <div className="flex items-center justify-between pr-6">
              <span className="text-[10px] font-pixel font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Tingkatan Akun
              </span>
              <span className="text-xs text-slate-400 font-pixel">
                {totalXp} XP
              </span>
            </div>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-1.5">
              <span>Daftar Level & Title</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Kumpulkan XP dari catatan harian untuk membuka level dan title baru.
            </DialogDescription>
          </DialogHeader>

          {/* Current Rank Showcase Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white shadow-md flex items-center justify-between relative overflow-hidden">
            <div className="flex items-center gap-3 relative z-10">
              {/* Avatar with Current Tier Ring */}
              <div className="relative">
                <div
                  className={cn(
                    "w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-base shadow-sm transition-all",
                    currentTier.ringClass
                  )}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                {/* Tier Border Symbol */}
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-slate-900 shadow-xs flex items-center justify-center text-[10px] font-bold border border-slate-200">
                  {currentTier.borderSymbol}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-pixel text-emerald-400">
                    Lv.{currentLevel}
                  </span>
                  <span className="text-[10px] text-slate-400">•</span>
                  <span className="text-xs font-bold text-white tracking-tight">
                    {levelInfo.title}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-slate-300 font-medium">
                    {currentTier.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/15 text-slate-200 font-pixel">
                    {currentTier.titleRange}
                  </span>
                </div>
              </div>
            </div>

            {/* Next Tier Status */}
            <div className="text-right relative z-10">
              <span className="text-[10px] text-slate-400 block font-medium">
                {levelInfo.isMaxLevel ? "Level Maksimal" : "Target Berikutnya"}
              </span>
              <span className="text-xs font-bold text-emerald-400 font-pixel block">
                {levelInfo.isMaxLevel
                  ? "Maksimal"
                  : `Lv.${currentLevel + 1} (${levelInfo.xpNeededForNextTier - levelInfo.xpInCurrentTier} XP)`}
              </span>
            </div>

            {/* Decorative background glow */}
            <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none" />
          </div>
        </div>

        {/* Scrollable Tier List Grouped by Rank */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {TIER_GROUPS.map((group) => {
            const tiersInGroup = LEVEL_TIERS.filter(
              (t) => t.level >= group.minLevel && t.level <= group.maxLevel
            );

            const isGroupUnlocked = currentLevel >= group.minLevel;

            return (
              <div key={group.id} className="space-y-2">
                {/* Tier Group Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{group.borderSymbol}</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 tracking-tight font-pixel">
                          {group.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({group.titleRange})
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 leading-tight">
                        {group.description}
                      </p>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "text-[9px] font-bold px-2 py-0.5 rounded-full border shrink-0",
                      isGroupUnlocked
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    )}
                  >
                    {isGroupUnlocked ? "Terbuka" : "Terkunci"}
                  </span>
                </div>

                {/* Levels inside this Tier */}
                <div className="space-y-1.5">
                  {tiersInGroup.map((tier) => {
                    const isCurrent = tier.level === currentLevel;
                    const isUnlocked = tier.level <= currentLevel;
                    const xpNeeded = Math.max(0, tier.minXp - totalXp);

                    return (
                      <div
                        key={tier.level}
                        className={cn(
                          "p-2.5 rounded-xl border transition-all flex items-center justify-between",
                          isCurrent
                            ? "bg-emerald-50/80 border-emerald-300 shadow-xs ring-1 ring-emerald-200"
                            : isUnlocked
                            ? "bg-white border-slate-200/80"
                            : "bg-slate-100/60 border-slate-200/60 opacity-75"
                        )}
                      >
                        {/* Level Icon & Info */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Level Icon Badge */}
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0 border",
                              isCurrent
                                ? "bg-emerald-100 border-emerald-300 shadow-xs"
                                : isUnlocked
                                ? "bg-slate-50 border-slate-200"
                                : "bg-slate-200/60 border-slate-300 text-slate-400"
                            )}
                          >
                            {tier.icon}
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "text-[10px] font-pixel",
                                  isCurrent
                                    ? "text-emerald-700 font-bold"
                                    : isUnlocked
                                    ? "text-slate-700"
                                    : "text-slate-400"
                                )}
                              >
                                Lv.{tier.level}
                              </span>
                              <span className="text-[10px] text-slate-300">•</span>
                              <h5
                                className={cn(
                                  "text-xs font-bold truncate",
                                  isCurrent
                                    ? "text-emerald-900"
                                    : isUnlocked
                                    ? "text-slate-800"
                                    : "text-slate-500"
                                )}
                              >
                                {tier.title}
                              </h5>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block">
                              {tier.maxXp === null
                                ? `Min. ${tier.minXp} XP`
                                : `${tier.minXp} - ${tier.maxXp} XP`}
                            </span>
                          </div>
                        </div>

                        {/* Status Tag */}
                        <div className="shrink-0 pl-2">
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[9px] font-pixel font-bold shadow-xs">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>LEVEL AKTIF</span>
                            </span>
                          ) : isUnlocked ? (
                            <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <Check className="w-3 h-3 stroke-[3]" />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400">
                              <Lock className="w-3 h-3 text-slate-400" />
                              <span className="font-pixel text-[9px]">
                                Kurang {xpNeeded} XP
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Close Button */}
        <div className="p-3 bg-white border-t border-slate-200/80 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
