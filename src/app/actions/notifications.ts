"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import webpush from "web-push";

interface SubscriptionPayload {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@story-finance.com";

  if (!publicKey || !privateKey) {
    throw new Error("Kunci VAPID belum dikonfigurasi di environment server.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function savePushSubscription(payload: SubscriptionPayload) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  const { endpoint, keys } = payload;
  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return { success: false, error: "Data langganan notifikasi tidak lengkap." };
  }

  // 1. Simpan atau perbarui subscription perangkat di database
  const { error: subError } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: user.id,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
      { onConflict: "endpoint" }
    );

  if (subError) {
    console.error("Gagal menyimpan push subscription:", subError);
    return { success: false, error: "Gagal menyimpan langganan notifikasi ke database." };
  }

  // 2. Aktifkan reminder_enabled di profil pengguna
  await supabase
    .from("profiles")
    .update({ reminder_enabled: true })
    .eq("id", user.id);

  revalidatePath("/profile");
  return { success: true };
}

export async function removePushSubscription(endpoint?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  if (endpoint) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("endpoint", endpoint)
      .eq("user_id", user.id);
  } else {
    // Nonaktifkan semua subscription milik user jika endpoint tidak spesifik
    await supabase
      .from("push_subscriptions")
      .delete()
      .eq("user_id", user.id);
  }

  // Update profil reminder_enabled = false
  await supabase
    .from("profiles")
    .update({ reminder_enabled: false })
    .eq("id", user.id);

  revalidatePath("/profile");
  return { success: true };
}

export async function toggleDailyReminder(enabled: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ reminder_enabled: enabled })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: "Gagal memperbarui pengaturan pengingat." };
  }

  revalidatePath("/profile");
  return { success: true };
}

export async function sendTestPushNotification() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Tidak terautentikasi." };
  }

  try {
    initWebPush();
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Konfigurasi VAPID bermasalah.";
    return { success: false, error: msg };
  }

  // Ambil semua subscription perangkat user
  const { data: subscriptions, error } = await supabase
    .from("push_subscriptions")
    .select("*")
    .eq("user_id", user.id);

  if (error || !subscriptions || subscriptions.length === 0) {
    return {
      success: false,
      error: "Belum ada perangkat yang terdaftar. Nyalakan toggle notifikasi terlebih dahulu.",
    };
  }

  // Ambil data streak untuk personalisasi santai
  const { data: gamification } = await supabase
    .from("gamification_profiles")
    .select("current_streak")
    .eq("user_id", user.id)
    .maybeSingle();

  const streak = gamification?.current_streak || 0;
  const bodyMessage =
    streak > 0
      ? `Pengingat jam 20:00 WIB aktif. Streak ${streak} hari kamu aman!`
      : "Pengingat jam 20:00 WIB sudah aktif di HP kamu.";

  const testPayload = JSON.stringify({
    title: "🔔 Tes Notifikasi Story Finance",
    body: bodyMessage,
    url: "/profile",
  });

  let sentCount = 0;
  const expiredEndpoints: string[] = [];

  for (const sub of subscriptions) {
    const pushConfig = {
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh,
        auth: sub.auth,
      },
    };

    try {
      await webpush.sendNotification(pushConfig, testPayload);
      sentCount++;
    } catch (err: unknown) {
      console.warn("Gagal mengirim ke subscription:", sub.endpoint, err);
      // Status 410 (Gone) atau 404 artinya subscription sudah expired / dicabut oleh user di browser
      const statusCode = (err as { statusCode?: number })?.statusCode;
      if (statusCode === 410 || statusCode === 404) {
        expiredEndpoints.push(sub.endpoint);
      }
    }
  }

  // Hapus endpoint expired jika ada
  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  if (sentCount === 0 && expiredEndpoints.length > 0) {
    return {
      success: false,
      error: "Izin notifikasi di perangkat ini sudah kedaluwarsa. Matikan lalu nyalakan kembali toggle pengingat.",
    };
  }

  return { success: true, sentCount };
}
