import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Story Finance | Catat Cashflow & Jajan Harian",
  description: "Aplikasi pencatatan cashflow harian personal dengan budgeting dan gamifikasi yang menyenangkan.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Story Finance",
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
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-emerald-500 selection:text-white">
        <div className="mx-auto max-w-md min-h-screen flex flex-col bg-white shadow-xl relative pb-20">
          {children}
        </div>
      </body>
    </html>
  );
}
