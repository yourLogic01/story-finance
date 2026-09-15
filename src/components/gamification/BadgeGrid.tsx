"use client";

import { useState } from "react";
import { BadgeWithStatus } from "@/app/actions/gamification";
import {
  Award,
  Flame,
  Zap,
  Crown,
  ShieldCheck,
  Star,
  Lock,
  Sparkles,
  LucideIcon,
  CheckCircle2,
  Target,
  Layers,
  TrendingUp,
  PieChart,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { formatDisplayDate } from "@/lib/utils/date";

const BADGE_ICON_MAP: Record<string, { icon: LucideIcon; color: string; bg: string }> = {
  award: { icon: Award, color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
  target: { icon: Target, color: "text-blue-500", bg: "bg-blue-50 border-blue-200" },
  sparkles: { icon: Sparkles, color: "text-amber-500", bg: "bg-amber-50 border-amber-200" },
  layers: { icon: Layers, color: "text-indigo-500", bg: "bg-indigo-50 border-indigo-200" },
  "trending-up": { icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  "pie-chart": { icon: PieChart, color: "text-teal-500", bg: "bg-teal-50 border-teal-200" },
  flame: { icon: Flame, color: "text-orange-500", bg: "bg-orange-50 border-orange-200" },
  zap: { icon: Zap, color: "text-yellow-500", bg: "bg-yellow-50 border-yellow-200" },
  crown: { icon: Crown, color: "text-purple-500", bg: "bg-purple-50 border-purple-200" },
  "shield-check": { icon: ShieldCheck, color: "text-emerald-500", bg: "bg-emerald-50 border-emerald-200" },
  star: { icon: Star, color: "text-rose-500", bg: "bg-rose-50 border-rose-200" },
};

interface BadgeGridProps {
  badges: BadgeWithStatus[];
}

export function BadgeGrid({ badges }: BadgeGridProps) {
  const [selectedBadge, setSelectedBadge] = useState<BadgeWithStatus | null>(null);

  const unlockedCount = badges.filter((b) => b.unlocked).length;

  return (
    <div className="space-y-3">
      {/* Header with counter */}
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Lencana Pencapaian</span>
        </h3>
        <span className="text-[10px] font-pixel px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
          {unlockedCount} / {badges.length} Terbuka
        </span>
      </div>

      {/* Badges Grid (2-columns on mobile) */}
      <div className="grid grid-cols-2 gap-2.5">
        {badges.map((badge) => {
          const config = BADGE_ICON_MAP[badge.icon] || {
            icon: Award,
            color: "text-slate-500",
            bg: "bg-slate-50 border-slate-200",
          };
          const Icon = config.icon;

          return (
            <button
              key={badge.id}
              type="button"
              onClick={() => setSelectedBadge(badge)}
              className={`p-3 rounded-2xl border text-left transition-all duration-200 relative group active:scale-98 ${
                badge.unlocked
                  ? "bg-white border-slate-200/90 shadow-xs hover:border-slate-300"
                  : "bg-slate-50/70 border-slate-200/50 opacity-60 hover:opacity-80"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                    badge.unlocked
                      ? `${config.bg} ${config.color} shadow-xs`
                      : "bg-slate-200 border-slate-300 text-slate-400"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {badge.unlocked ? (
                  <span className="text-[9px] font-pixel text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    +{badge.xp_reward}XP
                  </span>
                ) : (
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                    <Lock className="w-2.5 h-2.5" />
                  </div>
                )}
              </div>

              <h4 className="text-xs font-bold text-slate-800 line-clamp-1 leading-tight mb-0.5">
                {badge.title}
              </h4>
              <p className="text-[10px] text-slate-400 line-clamp-2 leading-relaxed">
                {badge.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Badge Detail Modal */}
      <Dialog open={!!selectedBadge} onOpenChange={(open) => !open && setSelectedBadge(null)}>
        {selectedBadge && (
          <DialogContent className="w-[calc(100%-2rem)] max-w-[340px] p-5 rounded-2xl">
            {(() => {
              const config = BADGE_ICON_MAP[selectedBadge.icon] || {
                icon: Award,
                color: "text-slate-500",
                bg: "bg-slate-50 border-slate-200",
              };
              const Icon = config.icon;

              return (
                <div className="flex flex-col items-center text-center space-y-3 pt-2">
                  <div
                    className={`w-14 h-14 rounded-2xl border flex items-center justify-center ${
                      selectedBadge.unlocked
                        ? `${config.bg} ${config.color} shadow-retro-sm`
                        : "bg-slate-100 border-slate-300 text-slate-400"
                    }`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>

                  <DialogHeader className="space-y-1 text-center">
                    <DialogTitle className="text-sm font-bold text-slate-900">
                      {selectedBadge.title}
                    </DialogTitle>
                    <span className="text-[10px] font-pixel text-emerald-600 block">
                      +{selectedBadge.xp_reward} XP Reward
                    </span>
                    <DialogDescription className="text-xs text-slate-600 leading-relaxed pt-1">
                      {selectedBadge.description}
                    </DialogDescription>
                  </DialogHeader>

                  <div className="w-full pt-2 border-t border-slate-100 text-center">
                    {selectedBadge.unlocked ? (
                      <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>
                          Terbuka pada{" "}
                          {selectedBadge.unlocked_at
                            ? formatDisplayDate(selectedBadge.unlocked_at)
                            : "sebelumnya"}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Belum terbuka. Capai milestone untuk membuka lencana ini!</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
