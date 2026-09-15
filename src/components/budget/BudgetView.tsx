"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { BudgetProgressBar } from "@/components/budget/BudgetProgressBar";
import { ConfigureBudgetModal } from "@/components/budget/ConfigureBudgetModal";
import { CreateCategoryModal } from "@/components/budget/CreateCategoryModal";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import {
  Category,
  GamificationProfile,
  SelfRewardAllowance,
} from "@/types";
import { BudgetWithSpending } from "@/app/actions/budgets";
import { deleteCategory } from "@/app/actions/categories";
import { formatIDR } from "@/lib/utils/currency";
import { getMonthName } from "@/lib/utils/date";
import { getCategoryIcon } from "@/lib/utils/icons";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Trash2,
  Sliders,
  Wallet,
  Coins,
} from "lucide-react";

interface BudgetViewProps {
  budgets: BudgetWithSpending[];
  categories: Category[];
  totalIncome: number;
  selfRewardAllowance: SelfRewardAllowance;
  gamification: GamificationProfile | null;
  currentYear: number;
  currentMonth: number;
}

export function BudgetView({
  budgets,
  categories,
  totalIncome,
  selfRewardAllowance,
  gamification,
  currentYear: initYear,
  currentMonth: initMonth,
}: BudgetViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  const [year, setYear] = useState(initYear);
  const [month, setMonth] = useState(initMonth);

  // Modals state
  const [isConfigureOpen, setIsConfigureOpen] = useState(false);
  const [selectedBudgetCategory, setSelectedBudgetCategory] = useState<Category | null>(null);
  const [isCreateCategoryOpen, setIsCreateCategoryOpen] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  // Navigation Month & Year
  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    router.push(`/budgets?year=${newYear}&month=${newMonth}`);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 12) {
      newMonth = 1;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    router.push(`/budgets?year=${newYear}&month=${newMonth}`);
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (!window.confirm(`Hapus kategori "${name}"?`)) {
      return;
    }
    await deleteCategory(id);
    startTransition(() => {
      router.refresh();
    });
  };

  // Find Self-Reward Category
  const selfRewardCategory = categories.find((c) =>
    c.name.toLowerCase().includes("self-reward")
  );

  const customCategories = categories.filter((c) => !c.is_default);

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50/50">
      {/* Header */}
      <Header
        currentStreak={gamification?.current_streak ?? 0}
        totalXp={gamification?.total_xp ?? 0}
      />

      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-24">
        {/* Month Navigation */}
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={handlePrevMonth}
            aria-label="Bulan Sebelumnya"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="text-center">
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Anggaran {getMonthName(month)} {year}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              Pemasukan: {formatIDR(totalIncome)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Bulan Berikutnya"
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-600 active:scale-95 transition-all"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Self-Reward Budget Highlight */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                <Wallet className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">
                Budget Self-Reward
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                setSelectedBudgetCategory(selfRewardCategory || null);
                setIsConfigureOpen(true);
              }}
              className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-200/60 transition-colors"
            >
              <Sliders className="w-3 h-3" />
              <span>{selfRewardAllowance.configured ? "Ubah Limit" : "Atur Limit"}</span>
            </button>
          </div>

          {selfRewardAllowance.configured ? (
            <div className="space-y-2">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Sisa anggaran:</span>
                  <h3
                    className={`text-lg font-bold font-pixel tracking-tight ${
                      selfRewardAllowance.healthStatus === "overbudget"
                        ? "text-rose-600"
                        : selfRewardAllowance.healthStatus === "warning"
                        ? "text-amber-600"
                        : "text-slate-900"
                    }`}
                  >
                    {formatIDR(selfRewardAllowance.remainingAllowance)}
                  </h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {selfRewardAllowance.percentageUsed}% terpakai
                </span>
              </div>

              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    selfRewardAllowance.healthStatus === "overbudget"
                      ? "bg-rose-500"
                      : selfRewardAllowance.healthStatus === "warning"
                      ? "bg-amber-500"
                      : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(selfRewardAllowance.percentageUsed, 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500">
                <span>Terpakai: {formatIDR(selfRewardAllowance.totalSpent)}</span>
                <span>Batas: {formatIDR(selfRewardAllowance.effectiveLimit)}</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500 leading-relaxed">
              Belum ada batas anggaran jajan untuk bulan ini. Atur kuota agar pengeluaran hobi tetap terkontrol.
            </p>
          )}
        </div>

        {/* Section 2: All Active Category Budgets */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Anggaran Kategori Lainnya
            </h3>
            <button
              type="button"
              onClick={() => {
                setSelectedBudgetCategory(null);
                setIsConfigureOpen(true);
              }}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Tambah Anggaran</span>
            </button>
          </div>

          {budgets.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
                <Coins className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold text-slate-800 mb-0.5">
                Belum Ada Anggaran
              </h4>
              <p className="text-xs text-slate-500 mb-3">
                Buat target batas pengeluaran untuk kategori favoritmu.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedBudgetCategory(null);
                  setIsConfigureOpen(true);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200/60 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Atur Anggaran Kategori</span>
              </button>
            </div>
          ) : (
            budgets.map((b) => <BudgetProgressBar key={b.id} budget={b} />)
          )}
        </div>

        {/* Section 3: Manage Categories (User Custom Categories) */}
        <div className="space-y-2.5 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Kategori Kustom
            </h3>
            <button
              type="button"
              onClick={() => setIsCreateCategoryOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Kategori Baru</span>
            </button>
          </div>

          {customCategories.length === 0 ? (
            <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs text-center">
              <p className="text-xs text-slate-500 mb-2">
                Kamu belum membuat kategori kustom. Ingin membuat kategori khusus seperti Skincare, Kopi, atau Langganan?
              </p>
              <button
                type="button"
                onClick={() => setIsCreateCategoryOpen(true)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Kategori Baru</span>
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs divide-y divide-slate-100">
              {customCategories.map((c) => {
                const Icon = getCategoryIcon(c.icon);
                return (
                  <div
                    key={c.id}
                    className="flex items-center justify-between p-3"
                  >
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: c.color }}
                      >
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <span className="text-xs font-semibold text-slate-800 block">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {c.type === "expense" ? "Pengeluaran" : "Pemasukan"}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      aria-label="Hapus Kategori"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Configure Budget Modal */}
      <ConfigureBudgetModal
        isOpen={isConfigureOpen}
        onClose={() => setIsConfigureOpen(false)}
        categories={categories}
        initialCategory={selectedBudgetCategory}
        year={year}
        month={month}
        onSuccess={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
      />

      {/* Create Category Modal */}
      <CreateCategoryModal
        isOpen={isCreateCategoryOpen}
        onClose={() => setIsCreateCategoryOpen(false)}
        onSuccess={() => {
          startTransition(() => {
            router.refresh();
          });
        }}
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

      {/* Bottom Navigation */}
      <MobileBottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
    </div>
  );
}
