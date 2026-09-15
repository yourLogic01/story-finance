import { Header } from "@/components/layout/Header";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="flex flex-col flex-1">
      <Header currentStreak={0} totalXp={0} />

      <main className="flex-1 p-4 flex flex-col items-center justify-center text-center">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 max-w-xs">
          <p className="text-xs font-semibold text-emerald-800">
            Halo, {user?.email ?? "Teman"}! 👋
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Fondasi sistem telah siap. Selanjutnya kita akan aktifkan tombol Catat Cepat (Quick Add) dan ringkasan cashflow bulanan.
          </p>
        </div>
      </main>

      <MobileBottomNav />
    </div>
  );
}
