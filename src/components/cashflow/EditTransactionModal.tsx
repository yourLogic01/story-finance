"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CategorySelector } from "./CategorySelector";
import { Category, TransactionWithCategory } from "@/types";
import { updateTransaction } from "@/app/actions/transactions";
import { formatIDR, parseIDRInput } from "@/lib/utils/currency";

interface EditTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  transaction: TransactionWithCategory | null;
  categories: Category[];
  onSuccess?: () => void;
}

export function EditTransactionModal({
  isOpen,
  onClose,
  transaction,
  categories,
  onSuccess,
}: EditTransactionModalProps) {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [rawAmount, setRawAmount] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [note, setNote] = useState<string>("");
  const [date, setDate] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Synchronize state when transaction prop changes
  useEffect(() => {
    if (transaction) {
      setType(transaction.type);
      setRawAmount(String(transaction.amount));
      setCategoryId(transaction.category_id);
      setNote(transaction.note || "");
      setDate(transaction.date);
      setErrorMsg(null);
    }
  }, [transaction]);

  if (!transaction) return null;

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const parsed = parseIDRInput(val);
    setRawAmount(parsed > 0 ? String(parsed) : "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseIDRInput(rawAmount);

    if (amountNum <= 0) {
      setErrorMsg("Masukkan nominal yang valid");
      return;
    }

    if (!categoryId) {
      setErrorMsg("Pilih salah satu kategori");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await updateTransaction(transaction.id, {
      amount: amountNum,
      type,
      categoryId,
      date,
      note: note.trim() || undefined,
    });

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || "Gagal memperbarui transaksi.");
    } else {
      onClose();
      onSuccess?.();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[calc(100%-2rem)] max-w-[400px] p-5 rounded-2xl">
        <DialogHeader className="pb-2 pr-8 text-left">
          <DialogTitle className="text-xs font-pixel tracking-wider text-slate-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>EDIT TRANSAKSI</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-2.5 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Type Selector Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setType("expense");
                setCategoryId(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === "expense"
                  ? "bg-rose-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => {
                setType("income");
                setCategoryId(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                type === "income"
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Amount input */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Nominal (Rp)
            </label>
            <Input
              type="text"
              inputMode="numeric"
              placeholder="0"
              value={rawAmount ? formatIDR(parseInt(rawAmount, 10)) : ""}
              onChange={handleAmountChange}
              className="text-lg font-bold pl-3 h-12"
              required
            />
          </div>

          {/* Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Pilih Kategori
            </label>
            <CategorySelector
              categories={filteredCategories}
              selectedId={categoryId}
              onSelect={(id) => setCategoryId(id)}
            />
          </div>

          {/* Note & Date */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-500">
                Catatan (Opsional)
              </label>
              <Input
                type="text"
                placeholder="Keterangan transaksi"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={50}
                className="text-xs h-9"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-500">
                Tanggal
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="text-xs h-9"
                required
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-11 text-xs font-bold rounded-xl mt-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {loading ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
