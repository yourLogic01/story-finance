"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, History, PieChart, Trophy, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface MobileBottomNavProps {
  onQuickAddClick?: () => void;
}

export function MobileBottomNav({ onQuickAddClick }: MobileBottomNavProps) {
  const pathname = usePathname();

  // Do not display bottom nav on auth pages
  if (pathname.startsWith("/login") || pathname.startsWith("/register")) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2">
      <div className="flex items-center justify-between relative">
        {/* Left 2 items */}
        <Link
          href="/"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors text-xs font-medium",
            pathname === "/"
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <LayoutDashboard className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/history"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors text-xs font-medium",
            pathname.startsWith("/history")
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <History className="w-5 h-5 mb-0.5" />
          <span>Histori</span>
        </Link>

        {/* Center Action Button (+) for Quick Add */}
        <div className="flex-1 flex justify-center -mt-6">
          <button
            type="button"
            onClick={onQuickAddClick}
            aria-label="Catat Transaksi Cepat"
            className="w-13 h-13 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white flex items-center justify-center shadow-lg border-4 border-white transition-transform"
          >
            <Plus className="w-7 h-7 stroke-[2.5]" />
          </button>
        </div>

        {/* Right 2 items */}
        <Link
          href="/budgets"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors text-xs font-medium",
            pathname.startsWith("/budgets")
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <PieChart className="w-5 h-5 mb-0.5" />
          <span>Budget</span>
        </Link>

        <Link
          href="/profile"
          className={cn(
            "flex flex-col items-center justify-center flex-1 py-1 transition-colors text-xs font-medium",
            pathname.startsWith("/profile")
              ? "text-emerald-600 font-bold"
              : "text-slate-500 hover:text-slate-900"
          )}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span>Profil</span>
        </Link>
      </div>
    </div>
  );
}
