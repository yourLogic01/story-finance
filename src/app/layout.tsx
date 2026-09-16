import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { ServiceWorkerRegister } from "@/components/layout/ServiceWorkerRegister";
import { OfflineBanner } from "@/components/layout/OfflineBanner";
import "./globals.css";

const poppins = Poppins({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Story Finance - Catatan Keuangan Harian",
  description: "Catat pemasukan, pengeluaran harian, dan pantau batas anggaran.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Story Finance",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512x512.png", sizes: "512x512", type: "image/png" },
      { url: "/icons/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/icon-192x192.png", sizes: "192x192", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#10B981",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <body className={`${poppins.className} font-sans min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white`}>
        <ServiceWorkerRegister />
        <OfflineBanner />
        <div className="mx-auto max-w-md min-h-screen flex flex-col bg-white shadow-xl relative">
          {children}
        </div>
      </body>
    </html>
  );
}
