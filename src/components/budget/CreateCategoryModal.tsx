"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCategory } from "@/app/actions/categories";
import { CATEGORY_ICON_MAP } from "@/lib/utils/icons";
import { Check } from "lucide-react";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const PRESET_COLORS = [
  "#10B981", // Emerald
  "#3B82F6", // Blue
  "#F59E0B", // Amber
  "#EC4899", // Pink
  "#8B5CF6", // Purple
  "#EF4444", // Rose
  "#06B6D4", // Cyan
  "#64748B", // Slate
];

export function CreateCategoryModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateCategoryModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"expense" | "income">("expense");
  const [selectedIcon, setSelectedIcon] = useState("tag");
  const [selectedColor, setSelectedColor] = useState("#10B981");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const resetForm = () => {
    setName("");
    setType("expense");
    setSelectedIcon("tag");
    setSelectedColor("#10B981");
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setErrorMsg("Nama kategori minimal 2 karakter");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const result = await createCategory({
      name: name.trim(),
      type,
      icon: selectedIcon,
      color: selectedColor,
    });

    setLoading(false);

    if (!result.success) {
      setErrorMsg(result.error || "Gagal membuat kategori.");
    } else {
      resetForm();
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
            <span>KATEGORI BARU</span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {errorMsg && (
            <div className="p-2 text-xs bg-rose-50 border border-rose-200 text-rose-600 rounded-lg">
              {errorMsg}
            </div>
          )}

          {/* Type Selector Toggle */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType("expense")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === "expense"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pengeluaran
            </button>
            <button
              type="button"
              onClick={() => setType("income")}
              className={`py-1.5 text-xs font-bold rounded-lg transition-all ${
                type === "income"
                  ? "bg-emerald-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Pemasukan
            </button>
          </div>

          {/* Name Input */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Nama Kategori
            </label>
            <Input
              type="text"
              placeholder="Contoh: Skincare, Kopi, Buku"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={30}
              className="text-xs h-10"
              required
            />
          </div>

          {/* Icon Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Pilih Ikon
            </label>
            <div className="grid grid-cols-6 gap-1.5 p-1.5 bg-slate-50 rounded-xl border border-slate-100 max-h-32 overflow-y-auto">
              {Object.entries(CATEGORY_ICON_MAP).map(([key, IconComp]) => {
                const isSelected = selectedIcon === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setSelectedIcon(key)}
                    className={`h-9 rounded-lg flex items-center justify-center transition-all ${
                      isSelected
                        ? "bg-slate-900 text-white shadow-xs scale-105"
                        : "text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <IconComp className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">
              Pilih Warna
            </label>
            <div className="flex items-center gap-2 justify-between p-1.5 bg-slate-50 rounded-xl border border-slate-100">
              {PRESET_COLORS.map((c) => {
                const isSelected = selectedColor === c;
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-transform active:scale-90"
                    style={{ backgroundColor: c }}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-10 text-xs font-bold rounded-xl mt-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {loading ? "Menyimpan..." : "Buat Kategori"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
