import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import webpush from "web-push";

// Initialize Supabase admin/server client using Service or Anon Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

function initWebPush() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@story-finance.com";

  if (!publicKey || !privateKey) {
    throw new Error("Kunci VAPID belum dikonfigurasi.");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

export async function GET(request: Request) {
  // 1. Verifikasi Keamanan Cron (Vercel Cron Header atau query key)
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const queryKey = searchParams.get("key");

  if (cronSecret) {
    const isHeaderValid = authHeader === `Bearer ${cronSecret}`;
    const isQueryValid = queryKey === cronSecret;

    if (!isHeaderValid && !isQueryValid) {
      return NextResponse.json(
        { success: false, error: "Unauthorized cron trigger." },
        { status: 401 }
      );
    }
  }

  try {
    initWebPush();
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, error: (err as Error).message },
      { status: 500 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  // 2. Tentukan tanggal hari ini dalam zona waktu Indonesia (WIB / Asia/Jakarta)
  const todayStr = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
  }).format(new Date());

  // 3. Ambil semua profil pengguna yang mengaktifkan pengingat
  const { data: reminderProfiles, error: profileErr } = await supabase
    .from("profiles")
    .select("id, display_name")
    .eq("reminder_enabled", true);

  if (profileErr || !reminderProfiles || reminderProfiles.length === 0) {
    return NextResponse.json({
      success: true,
      message: "Tidak ada user dengan pengingat aktif.",
      totalSent: 0,
    });
  }

  let totalSent = 0;
  let skippedAlreadyLogged = 0;
  const expiredEndpoints: string[] = [];

  // 4. Proses setiap pengguna
  for (const profile of reminderProfiles) {
    const userId = profile.id;

    // Cek apakah user sudah mencatat transaksi hari ini
    const { count: todayTxCount } = await supabase
      .from("transactions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("date", todayStr);

    if (todayTxCount && todayTxCount > 0) {
      // User sudah mencatat transaksi hari ini, jangan ganggu!
      skippedAlreadyLogged++;
      continue;
    }

    // Ambil endpoint subscription milik user
    const { data: subscriptions } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (!subscriptions || subscriptions.length === 0) {
      continue;
    }

    // Ambil data gamifikasi untuk pesan personal santai
    const { data: gamification } = await supabase
      .from("gamification_profiles")
      .select("current_streak")
      .eq("user_id", userId)
      .maybeSingle();

    const streak = gamification?.current_streak || 0;

    // Copywriting santai & memotivasi (bebas gaya robotik / AI generated)
    let title = "Sudah jajan apa aja hari ini? ☕";
    let body = "Catat pengeluaranmu sekarang biar dompet tetap terkontrol dan dapat bonus XP!";

    if (streak > 0) {
      title = `🔥 Streak ${streak} hari kamu sayang kalau putus!`;
      body = "Yuk sempetin 10 detik buat catat pengeluaran hari ini sebelum jam 12 malam.";
    }

    const payload = JSON.stringify({
      title,
      body,
      url: "/",
    });

    // Kirim push ke setiap device user
    for (const sub of subscriptions) {
      const pushConfig = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushConfig, payload);
        totalSent++;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 410 || statusCode === 404) {
          expiredEndpoints.push(sub.endpoint);
        }
      }
    }
  }

  // Bersihkan endpoint yang expired
  if (expiredEndpoints.length > 0) {
    await supabase
      .from("push_subscriptions")
      .delete()
      .in("endpoint", expiredEndpoints);
  }

  return NextResponse.json({
    success: true,
    date: todayStr,
    totalProfilesChecked: reminderProfiles.length,
    skippedAlreadyLogged,
    totalNotificationsSent: totalSent,
    cleanedExpiredEndpoints: expiredEndpoints.length,
  });
}
