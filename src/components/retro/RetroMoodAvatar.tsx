"use client";

import { FinancialMood } from "@/types";

interface RetroMoodAvatarProps {
  mood: FinancialMood;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function RetroMoodAvatar({
  mood,
  size = "md",
  showLabel = false,
}: RetroMoodAvatarProps) {
  const moodConfig = {
    happy: {
      label: "SEHAT",
      sublabel: "Cashflow Aman",
      colorClass: "bg-emerald-500/15 border-emerald-400/30 text-emerald-400",
      badgeColor: "bg-emerald-500 text-white",
      renderPixelFace: () => (
        // 8-bit Happy Pixel Face
        <svg
          viewBox="0 0 16 16"
          className="w-full h-full fill-current"
          shapeRendering="crispEdges"
        >
          {/* Eyes (happy arches) */}
          <rect x="3" y="5" width="3" height="1" />
          <rect x="2" y="6" width="1" height="2" />
          <rect x="10" y="5" width="3" height="1" />
          <rect x="13" y="6" width="1" height="2" />
          {/* Cheeks */}
          <rect x="2" y="9" width="2" height="1" opacity="0.4" />
          <rect x="12" y="9" width="2" height="1" opacity="0.4" />
          {/* Smile mouth */}
          <rect x="4" y="10" width="1" height="1" />
          <rect x="11" y="10" width="1" height="1" />
          <rect x="5" y="11" width="6" height="1" />
        </svg>
      ),
    },
    neutral: {
      label: "STABIL",
      sublabel: "Pengeluaran Berimbang",
      colorClass: "bg-sky-500/15 border-sky-400/30 text-sky-400",
      badgeColor: "bg-sky-500 text-white",
      renderPixelFace: () => (
        // 8-bit Neutral Pixel Face
        <svg
          viewBox="0 0 16 16"
          className="w-full h-full fill-current"
          shapeRendering="crispEdges"
        >
          {/* Dot Eyes */}
          <rect x="3" y="6" width="2" height="2" />
          <rect x="11" y="6" width="2" height="2" />
          {/* Straight Mouth */}
          <rect x="5" y="11" width="6" height="1" />
        </svg>
      ),
    },
    worried: {
      label: "DEFISIT",
      sublabel: "Pengeluaran Berlebih",
      colorClass: "bg-rose-500/15 border-rose-400/30 text-rose-400",
      badgeColor: "bg-rose-500 text-white",
      renderPixelFace: () => (
        // 8-bit Worried Pixel Face
        <svg
          viewBox="0 0 16 16"
          className="w-full h-full fill-current"
          shapeRendering="crispEdges"
        >
          {/* Wide Eyes */}
          <rect x="3" y="5" width="3" height="3" />
          <rect x="10" y="5" width="3" height="3" />
          {/* Sweat drop on forehead */}
          <rect x="14" y="2" width="1" height="2" />
          <rect x="13" y="4" width="1" height="1" />
          {/* Wavy/Sad Mouth */}
          <rect x="5" y="12" width="2" height="1" />
          <rect x="7" y="11" width="2" height="1" />
          <rect x="9" y="12" width="2" height="1" />
        </svg>
      ),
    },
  }[mood] || {
    label: "STABIL",
    sublabel: "Pengeluaran Berimbang",
    colorClass: "bg-slate-500/15 border-slate-400/30 text-slate-400",
    badgeColor: "bg-slate-500 text-white",
    renderPixelFace: () => null,
  };

  const dimensions =
    size === "sm" ? "w-6 h-6 p-1" : size === "md" ? "w-8 h-8 p-1.5" : "w-12 h-12 p-2";

  return (
    <div className="inline-flex items-center gap-2">
      <div
        className={`${dimensions} rounded-xl border flex items-center justify-center shrink-0 ${moodConfig.colorClass}`}
      >
        {moodConfig.renderPixelFace()}
      </div>

      {showLabel && (
        <div className="leading-tight">
          <span className="text-[10px] font-pixel block tracking-tight">
            {moodConfig.label}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block">
            {moodConfig.sublabel}
          </span>
        </div>
      )}
    </div>
  );
}
