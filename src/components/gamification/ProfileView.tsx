"use client";

import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { QuickAddModal } from "@/components/cashflow/QuickAddModal";
import { RetroStreakFlame } from "@/components/retro/RetroStreakFlame";
import { RetroXpBar } from "@/components/retro/RetroXpBar";
import { BadgeGrid } from "@/components/gamification/BadgeGrid";
import { GamificationProfileResponse } from "@/app/actions/gamification";
import { Category, Profile } from "@/types";
import { createClient } from "@/lib/supabase/client";
import {
  Trophy,
  Flame,
  Zap,
  Receipt,
  LogOut,
  Bell,
  Clock,
  Send,
} from "lucide-react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { cn } from "@/lib/utils";
import {
  isPushNotificationSupported,
  subscribeToWebPush,
  unsubscribeFromWebPush,
  getExistingPushSubscription,
} from "@/lib/push/client";
import {
  savePushSubscription,
  removePushSubscription,
  sendTestPushNotification,
} from "@/app/actions/notifications";

interface ProfileViewProps {
  userProfile: Profile | null;
  userEmail: string;
  gamification: GamificationProfileResponse | null;
  totalTransactions: number;
  categories: Category[];
}

export function ProfileView({
  userProfile,
  userEmail,
  gamification,
  totalTransactions,
  categories,
}: ProfileViewProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  // Daily Reminder States
  const [isReminderEnabled, setIsReminderEnabled] = useState(
    userProfile?.reminder_enabled ?? false
  );
  const [isLoadingReminder, setIsLoadingReminder] = useState(false);
  const [isTestingReminder, setIsTestingReminder] = useState(false);
  const [reminderFeedback, setReminderFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  useEffect(() => {
    if (isPushNotificationSupported()) {
      getExistingPushSubscription().then((sub) => {
        if (sub && userProfile?.reminder_enabled) {
          setIsReminderEnabled(true);
        }
      });
    }
  }, [userProfile?.reminder_enabled]);

  const handleToggleReminder = async () => {
    setReminderFeedback(null);
    setIsLoadingReminder(true);

    if (!isReminderEnabled) {
      const result = await subscribeToWebPush();
      if (!result.success) {
        setReminderFeedback({ type: "error", message: result.error });
        setIsLoadingReminder(false);
        return;
      }

      const saveRes = await savePushSubscription(result.data);
      if (!saveRes.success) {
        setReminderFeedback({
          type: "error",
          message: saveRes.error || "Gagal menyimpan langganan notifikasi.",
        });
        setIsLoadingReminder(false);
        return;
      }

      setIsReminderEnabled(true);
      setReminderFeedback({
        type: "success",
        message: "Pengingat jam 20:00 WIB berhasil aktif di perangkat ini!",
      });
    } else {
      const unsubs = await unsubscribeFromWebPush();
      if (unsubs.success) {
        await removePushSubscription(unsubs.endpoint);
        setIsReminderEnabled(false);
        setReminderFeedback({
          type: "success",
          message: "Pengingat harian berhasil dinonaktifkan.",
        });
      } else {
        setReminderFeedback({ type: "error", message: unsubs.error });
      }
    }

    setIsLoadingReminder(false);
  };

  const handleSendTest = async () => {
    setReminderFeedback(null);
    setIsTestingReminder(true);
    const result = await sendTestPushNotification();
    setIsTestingReminder(false);

    if (result.success) {
      setReminderFeedback({
        type: "success",
        message: "Notifikasi percobaan berhasil dikirim! Periksa bar notifikasi perangkat Anda.",
      });
    } else {
      setReminderFeedback({
        type: "error",
        message: result.error || "Gagal mengirim notifikasi percobaan.",
      });
    }
  };

  const displayName =
    userProfile?.display_name || userEmail.split("@")[0] || "Pencatat Bijak";

  const handleConfirmLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const currentStreak = gamification?.currentStreak ?? 0;
  const longestStreak = gamification?.longestStreak ?? 0;
  const totalXp = gamification?.totalXp ?? 0;
  const currentLevel = gamification?.currentLevel ?? 1;

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-slate-50/50">
      {/* Header */}
      <Header currentStreak={currentStreak} totalXp={totalXp} />

      <main className="flex-1 p-4 space-y-4 max-w-md mx-auto w-full pb-24">
        {/* User Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg shadow-retro-sm shrink-0">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm font-bold text-slate-900 truncate leading-tight">
                {displayName}
              </h2>
              <span className="text-xs text-slate-400 truncate block mt-0.5">
                {userEmail}
              </span>
              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-pixel text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span>Lv.{currentLevel}</span>
                <span>•</span>
                <span>{gamification?.levelTitle || "Pemula Hemat"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Stats Grid (2x2) */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Streak Aktif */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Streak Aktif
              </span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <div className="pt-0.5">
              <RetroStreakFlame streak={currentStreak} size="md" showLabel />
            </div>
          </div>

          {/* 2. Rekor Streak */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Rekor Terbaik
              </span>
              <Trophy className="w-4 h-4 text-purple-500" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-bold font-pixel text-slate-900">
                {longestStreak}
              </span>
              <span className="text-xs text-slate-500 font-medium">Hari</span>
            </div>
          </div>

          {/* 3. Total XP */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Total XP
              </span>
              <Zap className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-bold font-pixel text-slate-900">
                {totalXp}
              </span>
              <span className="text-xs text-slate-500 font-medium">XP</span>
            </div>
          </div>

          {/* 4. Total Transaksi */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-1">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-[11px] font-semibold text-slate-500">
                Transaksi Dicatat
              </span>
              <Receipt className="w-4 h-4 text-blue-500" />
            </div>
            <div className="flex items-baseline gap-1.5 pt-1">
              <span className="text-xl font-bold font-pixel text-slate-900">
                {totalTransactions}
              </span>
              <span className="text-xs text-slate-500 font-medium">Log</span>
            </div>
          </div>
        </div>

        {/* 8-bit XP Progress Bar Section */}
        <RetroXpBar totalXp={totalXp} level={currentLevel} variant="card" />

        {/* Badges Grid Section */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <BadgeGrid badges={gamification?.badges || []} />
        </div>

        {/* Daily Reminder (Push Notification) Card */}
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                  <span>Pengingat Harian</span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100/80 text-amber-800">
                    20:00 WIB
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500">
                  Notifikasi HP jika belum mencatat pengeluaran
                </p>
              </div>
            </div>

            {/* Retro / Clean Switch Toggle */}
            <button
              type="button"
              role="switch"
              aria-checked={isReminderEnabled}
              onClick={handleToggleReminder}
              disabled={isLoadingReminder}
              className={cn(
                "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none",
                isReminderEnabled ? "bg-emerald-500" : "bg-slate-200",
                isLoadingReminder && "opacity-50 cursor-not-allowed"
              )}
            >
              <span
                className={cn(
                  "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
                  isReminderEnabled ? "translate-x-5" : "translate-x-0"
                )}
              />
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-[11px] flex items-center gap-1.5 text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Otomatis lewati jika sudah catat hari ini</span>
            </span>

            {isReminderEnabled && (
              <button
                type="button"
                onClick={handleSendTest}
                disabled={isTestingReminder}
                className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 active:scale-95 transition-all flex items-center gap-1 bg-emerald-50 hover:bg-emerald-100 px-2 py-1 rounded-lg"
              >
                <Send className="w-3 h-3" />
                <span>{isTestingReminder ? "Mengirim..." : "Tes Notif"}</span>
              </button>
            )}
          </div>

          {reminderFeedback && (
            <div
              className={cn(
                "p-2.5 text-xs rounded-xl border flex items-start gap-2 animate-in fade-in duration-200",
                reminderFeedback.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              )}
            >
              <span className="text-xs leading-relaxed">{reminderFeedback.message}</span>
            </div>
          )}
        </div>

        {/* Logout Section */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsLogoutConfirmOpen(true)}
            className="w-full h-11 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar dari Akun</span>
          </button>
        </div>
      </main>

      {/* Logout Confirm Dialog */}
      <ConfirmDialog
        isOpen={isLogoutConfirmOpen}
        onClose={() => setIsLogoutConfirmOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Keluar dari Akun?"
        description="Kamu akan keluar dari sesi aplikasi Story Finance di perangkat ini."
        confirmText="Keluar"
        cancelText="Batal"
        variant="danger"
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

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav onQuickAddClick={() => setIsQuickAddOpen(true)} />
    </div>
  );
}
