"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: displayName,
        },
      },
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      if (data?.session) {
        // Direct session established
        router.push("/");
        router.refresh();
      } else {
        // Confirmation email required
        setSuccessMsg(
          "Pendaftaran berhasil! Silakan periksa inbox email Anda untuk verifikasi atau langsung coba masuk."
        );
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center p-6 bg-slate-50 min-h-screen">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
          <span>Story Finance</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Mulai Cerita Finansialmu
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Daftar akun gratis dan kendalikan pengeluaran harianmu.
        </p>
      </div>

      <Card className="border shadow-sm">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-lg">Buat Akun Baru</CardTitle>
          <CardDescription>
            Hanya butuh 1 menit untuk memulai.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            {errorMsg && (
              <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-600 rounded-lg">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg">
                {successMsg}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Nama Panggilan</label>
              <Input
                type="text"
                placeholder="Misal: Asyifa"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Email</label>
              <Input
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700">Kata Sandi</label>
              <Input
                type="password"
                placeholder="Minimal 6 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                disabled={loading}
              />
            </div>

            <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <p className="text-center text-xs text-slate-500 mt-6">
        Sudah punya akun?{" "}
        <Link href="/login" className="text-emerald-600 font-semibold hover:underline">
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}
