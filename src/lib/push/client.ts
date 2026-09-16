/**
 * Web Push Client Helper
 * Handles browser permission, Service Worker pushManager subscription, and VAPID key conversion.
 */

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function isPushNotificationSupported(): boolean {
  if (typeof window === "undefined") return false;
  return (
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

export function getNotificationPermissionState(): NotificationPermission | "unsupported" {
  if (!isPushNotificationSupported()) return "unsupported";
  return Notification.permission;
}

export async function getExistingPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return null;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error("Gagal memeriksa push subscription:", error);
    return null;
  }
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function subscribeToWebPush(): Promise<
  { success: true; data: PushSubscriptionData } | { success: false; error: string }
> {
  if (!isPushNotificationSupported()) {
    return {
      success: false,
      error: "Browser atau perangkat ini belum mendukung Web Push Notifications.",
    };
  }

  try {
    // 1. Request permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      return {
        success: false,
        error: "Izin notifikasi tidak diberikan. Harap izinkan notifikasi pada pengaturan browser Anda.",
      };
    }

    const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      return {
        success: false,
        error: "Kunci VAPID Public belum dikonfigurasi di Environment Variables.",
      };
    }

    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

    // 2. Ensure Service Worker is registered & ready
    let registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      registration = await navigator.serviceWorker.register("/sw.js");
    }

    // Wait for ready with an 8-second safety timeout
    await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Timeout: Service Worker belum siap di peramban ini.")),
          8000
        )
      ),
    ]);

    // 3. Subscribe via pushManager
    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as unknown as BufferSource,
      });
    }

    const rawKey = subscription.getKey("p256dh");
    const rawAuth = subscription.getKey("auth");

    if (!rawKey || !rawAuth) {
      return {
        success: false,
        error: "Gagal mengekstrak kunci enkripsi perangkat.",
      };
    }

    const p256dh = btoa(String.fromCharCode(...new Uint8Array(rawKey)));
    const auth = btoa(String.fromCharCode(...new Uint8Array(rawAuth)));

    return {
      success: true,
      data: {
        endpoint: subscription.endpoint,
        keys: {
          p256dh,
          auth,
        },
      },
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Terjadi kesalahan saat mengaktifkan notifikasi.";
    console.error("Error subscribing to push:", err);
    return {
      success: false,
      error: errorMsg,
    };
  }
}

export async function unsubscribeFromWebPush(): Promise<
  { success: true; endpoint?: string } | { success: false; error: string }
> {
  if (!isPushNotificationSupported()) {
    return { success: true };
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();
      return { success: true, endpoint };
    }
    return { success: true };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Gagal menonaktifkan notifikasi browser.";
    return { success: false, error: errorMsg };
  }
}
