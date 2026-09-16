"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { TransactionItem } from "@/components/cashflow/TransactionItem";
import { EditTransactionModal } from "@/components/cashflow/EditTransactionModal";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import { Category, TransactionWithCategory, GamificationProfile, NoSpendDay } from "@/types";
import { deleteTransaction } from "@/app/actions/transactions";
import { formatDisplayDate, getMonthName } from "@/lib/utils/date";
import { formatIDR } from "@/lib/utils/currency";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Filter,
  History,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { getMonthlyRecapData, MonthlyRecapData } from "@/app/actions/recap";
import { RetroMonthlyRecapModal } from "@/components/retro/RetroMonthlyRecapModal";

interface HistoryViewProps {
  categories: Category[];
  initialTransactions: TransactionWithCategory[];
  gamification: GamificationProfile | null;
  noSpendDays?: NoSpendDay[];
  currentYear: number;
  currentMonth: number;
}

export function HistoryView({
  categories,
  initialTransactions,
  gamification,
  noSpendDays = [],
  currentYear: initYear,
  currentMonth: initMonth,
}: HistoryViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();

  // Navigation Month & Year
  const [year, setYear] = useState(initYear);
  const [month, setMonth] = useState(initMonth);

  // Filters
  const [typeFilter, setTypeFilter] = useState<"all" | "expense" | "income">("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithCategory | null>(
    null
  );
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // Retro Monthly Recap Modal State
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [recapData, setRecapData] = useState<MonthlyRecapData | null>(null);
  const [isRecapLoading, setIsRecapLoading] = useState(false);

  const handleOpenRecap = async () => {
    setIsRecapLoading(true);
    try {
      const data = await getMonthlyRecapData(year, month);
      setRecapData(data);
      setIsRecapOpen(true);
    } finally {
      setIsRecapLoading(false);
    }
  };

  // Handle Month Change
  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 1) {
      newMonth = 12;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    router.push(`/history?year=${newYear}&month=${newMonth}`);
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
    router.push(`/history?year=${newYear}&month=${newMonth}`);
  };

  // State for delete confirm dialog
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Handle Delete
  const handleDelete = (id: string) => {
    setDeleteTargetId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeletingId(deleteTargetId);
    await deleteTransaction(deleteTargetId);
    setIsDeletingId(null);
    setDeleteTargetId(null);
    startTransition(() => {
      router.refresh();
    });
  };

  // Client-side filtering of current loaded month's transactions
  const filteredTransactions = initialTransactions.filter((tx) => {
    if (typeFilter !== "all" && tx.type !== typeFilter) return false;
    if (selectedCategory !== "all" && tx.category_id !== selectedCategory) return false;
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.toLowerCase();
      const matchNote = tx.note?.toLowerCase().includes(q);
      const matchCat = tx.category?.name.toLowerCase().includes(q);
      if (!matchNote && !matchCat) return false;
    }
    return true;
  });

  // Calculate monthly stats for filtered view
  const totalIncome = filteredTransactions
    .filter((t) => t.type === "income")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  const totalExpense = filteredTransactions
    .filter((t) => t.type === "expense")
    .reduce((acc, curr) => acc + Number(curr.amount), 0);

  // Group transactions by date
  const groupedByDate: Record<string, TransactionWithCategory[]> = {};
  for (const tx of filteredTransactions) {
    if (!groupedByDate[tx.date]) {
      groupedByDate[tx.date] = [];
    }
    groupedByDate[tx.date].push(tx);
  }

  const sortedDates = Object.keys(groupedByDate).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50/50">
      {/* Header */}
      <Header
        currentStreak={gamification?.current_streak ?? 0}
        totalXp={gamification?.total_xp ?? 0}
      />

      <main className="flex-1 p-4 space-y-3.5 max-w-md mx-auto w-full pb-24">
        {/* Month Selector Bar */}
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
              {getMonthName(month)} {year}
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">
              {filteredTransactions.length} Transaksi
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

        {/* Retro Monthly Digest Trigger Button */}
        <button
          type="button"
          onClick={handleOpenRecap}
          disabled={isRecapLoading}
          className="w-full p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-pixel text-xs flex items-center justify-between shadow-retro-sm transition-all active:scale-[0.99] border border-slate-800"
        >
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>REKAP & FORECAST BULANAN</span>
          </div>
          <span className="text-[10px] text-emerald-400 font-sans font-bold flex items-center gap-1">
            {isRecapLoading ? "Memuat..." : "Buka ➔"}
          </span>
        </button>

        {/* Quick Month Filter Stats Pill */}
        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-emerald-700 font-pixel">
              {formatIDR(totalIncome)}
            </span>
          </div>

          <div className="p-2.5 rounded-xl bg-rose-50/70 border border-rose-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-xs font-bold text-rose-700 font-pixel">
              {formatIDR(totalExpense)}
            </span>
          </div>
        </div>

        {/* No-Spend Days Achievement Pill */}
        {noSpendDays && noSpendDays.length > 0 && (
          <div className="p-2.5 px-3.5 rounded-xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between shadow-2xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-emerald-950">
                Hari Bebas Belanja
              </span>
            </div>
            <span className="text-[10px] font-pixel font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 shadow-2xs">
              {noSpendDays.length} Hari Bebas Belanja 🛡️
            </span>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Cari transaksi atau catatan..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 text-xs bg-white rounded-xl border-slate-200"
          />
        </div>

        {/* Filter Pills: Type & Category */}
        <div className="space-y-2">
          {/* Type Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setTypeFilter("all")}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                typeFilter === "all"
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("expense")}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                typeFilter === "expense"
                  ? "bg-rose-500 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setTypeFilter("income")}
              className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                typeFilter === "income"
                  ? "bg-emerald-600 text-white font-semibold shadow-xs"
                  : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              Pemasukan
            </button>

            {/* Category Dropdown */}
            <div className="relative ml-auto shrink-0">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-white border border-slate-200 text-slate-700 rounded-xl px-2.5 py-1.5 pr-6 appearance-none font-medium focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              <Filter className="w-3 h-3 text-slate-400 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Transactions Grouped Feed */}
        {sortedDates.length === 0 ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <History className="w-6 h-6" />
            </div>
            <h4 className="text-xs font-bold text-slate-800 mb-1">Tidak Ada Transaksi</h4>
            <p className="text-xs text-slate-500">
              {searchQuery
                ? "Tidak ada transaksi yang cocok dengan kata kunci."
                : "Belum ada transaksi pada periode bulan ini."}
            </p>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const dayTransactions = groupedByDate[dateStr];
            const dailyNet = dayTransactions.reduce((acc, curr) => {
              return curr.type === "income" ? acc + Number(curr.amount) : acc - Number(curr.amount);
            }, 0);

            return (
              <div
                key={dateStr}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
              >
                {/* Date Group Header */}
                <div className="py-2 px-3.5 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{formatDisplayDate(dateStr)}</span>
                  <span
                    className={`font-pixel text-[10px] ${
                      dailyNet >= 0 ? "text-emerald-600" : "text-slate-700"
                    }`}
                  >
                    {dailyNet >= 0 ? "+" : ""}
                    {formatIDR(dailyNet)}
                  </span>
                </div>

                {/* Day's Transactions List */}
                <div className="divide-y divide-slate-100">
                  {dayTransactions.map((tx) => (
                    <TransactionItem
                      key={tx.id}
                      transaction={tx}
                      isDeleting={isDeletingId === tx.id}
                      onEdit={(target) => setEditingTransaction(target)}
                      onDelete={(id) => handleDelete(id)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </main>

      {/* Edit Modal */}
      <EditTransactionModal
        isOpen={!!editingTransaction}
        onClose={() => setEditingTransaction(null)}
        transaction={editingTransaction}
        categories={categories}
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

      {/* Retro Monthly Digest Modal */}
      <RetroMonthlyRecapModal
        isOpen={isRecapOpen}
        onClose={() => setIsRecapOpen(false)}
        recapData={recapData}
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Hapus Transaksi?"
        description="Transaksi ini akan dihapus permanen dari riwayat pencatatan keuanganmu."
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
    </div>
  );
}
