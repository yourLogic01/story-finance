"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, History, PieChart, Trophy } from "lucide-react";
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

  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: LayoutGrid,
      isActive: pathname === "/",
    },
    {
      label: "Histori",
      href: "/history",
      icon: History,
      isActive: pathname.startsWith("/history"),
    },
    {
      label: "Budget",
      href: "/budgets",
      icon: PieChart,
      isActive: pathname.startsWith("/budgets") || pathname.startsWith("/budget"),
    },
    {
      label: "Profil",
      href: "/profile",
      icon: Trophy,
      isActive: pathname.startsWith("/profile"),
    },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 max-w-md mx-auto z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_24px_rgba(0,0,0,0.04)] px-3 py-1.5"
    >
      <div className="flex items-center justify-between relative">
        {/* 1. Home */}
        <Link
          href={navItems[0].href}
          prefetch={true}
          className="flex-1 flex flex-col items-center justify-center py-1 group select-none transition-all duration-200 ease-out active:scale-95"
        >
          <div
            className={cn(
              "relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-300 ease-out",
              navItems[0].isActive
                ? "bg-emerald-50 text-emerald-600 scale-110 shadow-sm ring-1 ring-emerald-200/60"
                : "text-slate-400 group-hover:text-slate-600 group-hover:scale-105"
            )}
          >
            <LayoutGrid className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={cn(
              "text-[11px] mt-0.5 tracking-tight transition-all duration-200",
              navItems[0].isActive
                ? "font-bold text-emerald-600"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            )}
          >
            {navItems[0].label}
          </span>
          {/* Active dot indicator */}
          <span
            className={cn(
              "w-1 h-1 rounded-full mt-0.5 transition-all duration-300",
              navItems[0].isActive
                ? "bg-emerald-500 scale-100 opacity-100"
                : "bg-transparent scale-0 opacity-0"
            )}
          />
        </Link>

        {/* 2. Histori */}
        <Link
          href={navItems[1].href}
          prefetch={true}
          className="flex-1 flex flex-col items-center justify-center py-1 group select-none transition-all duration-200 ease-out active:scale-95"
        >
          <div
            className={cn(
              "relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-300 ease-out",
              navItems[1].isActive
                ? "bg-emerald-50 text-emerald-600 scale-110 shadow-sm ring-1 ring-emerald-200/60"
                : "text-slate-400 group-hover:text-slate-600 group-hover:scale-105"
            )}
          >
            <History className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={cn(
              "text-[11px] mt-0.5 tracking-tight transition-all duration-200",
              navItems[1].isActive
                ? "font-bold text-emerald-600"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            )}
          >
            {navItems[1].label}
          </span>
          <span
            className={cn(
              "w-1 h-1 rounded-full mt-0.5 transition-all duration-300",
              navItems[1].isActive
                ? "bg-emerald-500 scale-100 opacity-100"
                : "bg-transparent scale-0 opacity-0"
            )}
          />
        </Link>

        {/* Center: Tactile Pixel Plus Button */}
        <div className="flex-1 flex flex-col items-center justify-center -mt-6 relative z-10">
          <button
            type="button"
            onClick={onQuickAddClick}
            aria-label="Catat Transaksi Cepat"
            className="relative w-14 h-14 rounded-full bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:scale-95 transition-transform duration-150 flex items-center justify-center shadow-[0_6px_16px_rgba(16,185,129,0.4)] ring-4 ring-white focus:outline-none"
          >
            {/* Subtle inner tactile ring */}
            <div className="absolute inset-1 rounded-full border border-white/30 pointer-events-none" />

            {/* 8-bit Pixel Art Plus */}
            <svg
              className="w-5 h-5 text-white relative z-10 drop-shadow-sm"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
              style={{ shapeRendering: "crispEdges" }}
            >
              <rect x="6" y="2" width="4" height="12" />
              <rect x="2" y="6" width="12" height="4" />
            </svg>
          </button>
          {/* Invisible spacer to maintain height symmetry */}
          <span className="w-1 h-1 mt-1 opacity-0 pointer-events-none" />
        </div>

        {/* 3. Budget */}
        <Link
          href={navItems[2].href}
          prefetch={true}
          className="flex-1 flex flex-col items-center justify-center py-1 group select-none transition-all duration-200 ease-out active:scale-95"
        >
          <div
            className={cn(
              "relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-300 ease-out",
              navItems[2].isActive
                ? "bg-emerald-50 text-emerald-600 scale-110 shadow-sm ring-1 ring-emerald-200/60"
                : "text-slate-400 group-hover:text-slate-600 group-hover:scale-105"
            )}
          >
            <PieChart className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={cn(
              "text-[11px] mt-0.5 tracking-tight transition-all duration-200",
              navItems[2].isActive
                ? "font-bold text-emerald-600"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            )}
          >
            {navItems[2].label}
          </span>
          <span
            className={cn(
              "w-1 h-1 rounded-full mt-0.5 transition-all duration-300",
              navItems[2].isActive
                ? "bg-emerald-500 scale-100 opacity-100"
                : "bg-transparent scale-0 opacity-0"
            )}
          />
        </Link>

        {/* 4. Profil */}
        <Link
          href={navItems[3].href}
          prefetch={true}
          className="flex-1 flex flex-col items-center justify-center py-1 group select-none transition-all duration-200 ease-out active:scale-95"
        >
          <div
            className={cn(
              "relative flex items-center justify-center p-1.5 rounded-xl transition-all duration-300 ease-out",
              navItems[3].isActive
                ? "bg-emerald-50 text-emerald-600 scale-110 shadow-sm ring-1 ring-emerald-200/60"
                : "text-slate-400 group-hover:text-slate-600 group-hover:scale-105"
            )}
          >
            <Trophy className="w-5 h-5 stroke-[2.2]" />
          </div>
          <span
            className={cn(
              "text-[11px] mt-0.5 tracking-tight transition-all duration-200",
              navItems[3].isActive
                ? "font-bold text-emerald-600"
                : "font-medium text-slate-400 group-hover:text-slate-600"
            )}
          >
            {navItems[3].label}
          </span>
          <span
            className={cn(
              "w-1 h-1 rounded-full mt-0.5 transition-all duration-300",
              navItems[3].isActive
                ? "bg-emerald-500 scale-100 opacity-100"
                : "bg-transparent scale-0 opacity-0"
            )}
          />
        </Link>
      </div>
    </nav>
  );
}
