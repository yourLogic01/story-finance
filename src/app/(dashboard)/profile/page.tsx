import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { getGamificationProfile } from "@/app/actions/gamification";
import { ProfileView } from "@/components/gamification/ProfileView";
import { Category, Profile } from "@/types";

export const metadata = {
  title: "Profil & Pencapaian | Story Finance",
  description: "Lihat level, rekor streak, dan lencana pencapaian keuanganmu.",
};

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Execute all queries in parallel to eliminate waterfall latency
  const [
    { data: rawProfile },
    gamification,
    { count: txCount },
    { data: categories },
  ] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle(),
    getGamificationProfile(),
    supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id),
    supabase
      .from("categories")
      .select("*")
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order("name", { ascending: true }),
  ]);

  return (
    <ProfileView
      userProfile={rawProfile as Profile | null}
      userEmail={user.email || ""}
      gamification={gamification}
      totalTransactions={txCount || 0}
      categories={(categories as Category[]) || []}
    />
  );
}
