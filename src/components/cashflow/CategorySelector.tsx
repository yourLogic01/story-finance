"use client";

import { Category } from "@/types";
import {
  Coffee,
  ShoppingCart,
  Bus,
  FileText,
  Sparkles,
  HeartPulse,
  Tag,
  Briefcase,
  TrendingUp,
  DollarSign,
  PlusCircle,
  LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  coffee: Coffee,
  "shopping-cart": ShoppingCart,
  bus: Bus,
  "file-text": FileText,
  sparkles: Sparkles,
  "heart-pulse": HeartPulse,
  tag: Tag,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  "dollar-sign": DollarSign,
  "plus-circle": PlusCircle,
};

interface CategorySelectorProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (categoryId: string) => void;
}

export function CategorySelector({
  categories,
  selectedId,
  onSelect,
}: CategorySelectorProps) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {categories.map((cat) => {
        const IconComp = ICON_MAP[cat.icon] || Tag;
        const isSelected = selectedId === cat.id;

        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onSelect(cat.id)}
            className={cn(
              "flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs transition-all duration-150 active:scale-95 text-center",
              isSelected
                ? "border-emerald-600 bg-emerald-50 text-emerald-900 font-bold shadow-sm ring-2 ring-emerald-500/30"
                : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-lg flex items-center justify-center mb-1.5 transition-colors",
                isSelected
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-100 text-slate-600"
              )}
              style={
                !isSelected && cat.color
                  ? { backgroundColor: `${cat.color}15`, color: cat.color }
                  : undefined
              }
            >
              <IconComp className="w-4 h-4" />
            </div>
            <span className="truncate w-full leading-tight text-[11px]">
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
}
