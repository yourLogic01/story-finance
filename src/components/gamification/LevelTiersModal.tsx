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
import { Lock, Check } from "lucide-react";
import { RetroTierIcon } from "@/components/retro/RetroTierIcon";

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
      <DialogContent className="max-w-sm w-[calc(100%-2rem)] p-0 overflow-hidden border-slate-200/90 shadow-2xl rounded-2xl max-h-[88vh] flex flex-col bg-slate-50">
        {/* Compact Header */}
        <div className="px-4 py-3 bg-white border-b border-slate-200/80 shrink-0 space-y-2.5">
          <DialogHeader className="text-left space-y-0.5">
            <div className="flex items-center justify-between pr-6">
              <DialogTitle className="text-sm font-bold text-slate-900">
                Daftar Level & Title
              </DialogTitle>
              <span className="text-[11px] font-pixel text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {totalXp} XP
              </span>
            </div>
            <DialogDescription className="text-[11px] text-slate-500">
              Kumpulkan XP dari catatan harian untuk naik level.
            </DialogDescription>
          </DialogHeader>

          {/* Compact Current Rank Banner */}
          <div className="p-2.5 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              {/* Avatar with Tier Ring */}
              <div className="relative shrink-0">
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-white flex items-center justify-center font-bold text-xs shadow-xs",
                    currentTier.ringClass
                  )}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-2xs">
                  <RetroTierIcon tierId={currentTier.id} size={10} />
                </div>
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-pixel text-emerald-400">
                    Lv.{currentLevel}
                  </span>
                  <span className="text-xs font-bold text-white truncate">
                    {levelInfo.title}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 block leading-tight">
                  {currentTier.name} ({currentTier.titleRange})
                </span>
              </div>
            </div>

            {/* Target next level */}
            <div className="text-right shrink-0 pl-2">
              <span className="text-[9px] text-slate-400 block">
                {levelInfo.isMaxLevel ? "Level Maksimal" : "Target"}
              </span>
              <span className="text-[10px] font-bold text-emerald-400 font-pixel block leading-tight">
                {levelInfo.isMaxLevel
                  ? "MAX"
                  : `Lv.${currentLevel + 1} (${levelInfo.xpNeededForNextTier - levelInfo.xpInCurrentTier} XP)`}
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Level List */}
        <div className="flex-1 overflow-y-auto px-3.5 py-3 space-y-4">
          {TIER_GROUPS.map((group) => {
            const tiersInGroup = LEVEL_TIERS.filter(
              (t) => t.level >= group.minLevel && t.level <= group.maxLevel
            );
            const isGroupUnlocked = currentLevel >= group.minLevel;

            return (
              <div key={group.id} className="space-y-1.5">
                {/* Compact Tier Header */}
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <RetroTierIcon tierId={group.id} size={14} />
                    <h4 className="text-[11px] font-bold text-slate-800 tracking-tight font-pixel uppercase">
                      {group.name}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-medium">
                      ({group.titleRange})
                    </span>
                  </div>

                  <span
                    className={cn(
                      "text-[9px] font-semibold px-1.5 py-0.2 rounded border",
                      isGroupUnlocked
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-slate-100 text-slate-400 border-slate-200"
                    )}
                  >
                    {isGroupUnlocked ? "Terbuka" : "Terkunci"}
                  </span>
                </div>

                {/* Level Rows */}
                <div className="space-y-1">
                  {tiersInGroup.map((tier) => {
                    const isCurrent = tier.level === currentLevel;
                    const isUnlocked = tier.level <= currentLevel;
                    const xpNeeded = Math.max(0, tier.minXp - totalXp);

                    return (
                      <div
                        key={tier.level}
                        className={cn(
                          "px-2.5 py-2 rounded-xl border transition-all flex items-center justify-between gap-2",
                          isCurrent
                            ? "bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-200 shadow-xs"
                            : isUnlocked
                            ? "bg-white border-slate-200/80 shadow-2xs"
                            : "bg-slate-100/50 border-slate-200/60 opacity-70"
                        )}
                      >
                        {/* Left: Pixel Icon & Details */}
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={cn(
                              "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                              isCurrent
                                ? "bg-emerald-100 border-emerald-300"
                                : isUnlocked
                                ? "bg-slate-50 border-slate-200"
                                : "bg-slate-200/60 border-slate-300"
                            )}
                          >
                            <RetroTierIcon
                              tierId={tier.tierId}
                              size={14}
                              className={isUnlocked ? "" : "grayscale opacity-60"}
                            />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-baseline gap-1.5">
                              <span
                                className={cn(
                                  "text-[10px] font-pixel shrink-0",
                                  isCurrent
                                    ? "text-emerald-700 font-bold"
                                    : isUnlocked
                                    ? "text-slate-600"
                                    : "text-slate-400"
                                )}
                              >
                                Lv.{tier.level}
                              </span>
                              <h5
                                className={cn(
                                  "text-xs font-bold leading-tight",
                                  isCurrent
                                    ? "text-emerald-950"
                                    : isUnlocked
                                    ? "text-slate-800"
                                    : "text-slate-500"
                                )}
                              >
                                {tier.title}
                              </h5>
                            </div>
                            <span className="text-[10px] text-slate-400 font-medium block leading-tight mt-0.5">
                              {tier.maxXp === null
                                ? `Min. ${tier.minXp} XP`
                                : `${tier.minXp} - ${tier.maxXp} XP`}
                            </span>
                          </div>
                        </div>

                        {/* Right: Compact Status Badge */}
                        <div className="shrink-0">
                          {isCurrent ? (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-600 text-white text-[9px] font-pixel font-bold shadow-xs">
                              AKTIF
                            </span>
                          ) : isUnlocked ? (
                            <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 stroke-[3]" />
                            </div>
                          ) : (
                            <span className="text-[9px] font-pixel text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded flex items-center gap-1 border border-slate-200/60">
                              <Lock className="w-2.5 h-2.5" />
                              <span>-{xpNeeded} XP</span>
                            </span>
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

        {/* Compact Footer */}
        <div className="p-2.5 bg-white border-t border-slate-200/80 text-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-xs"
          >
            Tutup
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
