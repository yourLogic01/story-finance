"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
      email: email.trim(),
      password,
      options: {
        data: {
          full_name: displayName.trim(),
        },
      },
    });

    if (error) {
      if (error.message.includes("rate limit") || error.message.includes("exceeded")) {
        setErrorMsg(
          "Limit pengiriman email Supabase tercapai (3 email/jam). Harap matikan opsi 'Confirm email' di dashboard Supabase agar pendaftaran langsung aktif tanpa verifikasi email."
        );
      } else {
        setErrorMsg(error.message);
      }
      setLoading(false);
    } else {
      if (data?.session) {
        // Direct auto-login session established (Confirm email is disabled)
        router.push("/");
        router.refresh();
      } else {
        setSuccessMsg(
          "Pendaftaran berhasil. Silakan periksa inbox email untuk konfirmasi, atau matikan opsi 'Confirm email' di dashboard Supabase agar langsung masuk."
        );
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 justify-center px-6 py-12 min-h-screen bg-white">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Daftar Akun
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Buat akun baru untuk mulai mencatat keuangan harian Anda.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 text-xs bg-red-50 border border-red-200 text-red-700 rounded-md leading-relaxed">
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div className="p-3 text-xs bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-md leading-relaxed">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700">Nama</label>
            <Input
              type="text"
              placeholder="Nama Anda"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              required
              disabled={loading}
              className="h-10 text-sm"
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
              className="h-10 text-sm"
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
              className="h-10 text-sm"
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10"
            disabled={loading}
          >
            {loading ? "Mendaftarkan..." : "Daftar"}
          </Button>
        </form>

        <p className="text-center text-xs text-slate-500">
          Sudah memiliki akun?{" "}
          <Link href="/login" className="text-slate-900 font-semibold hover:underline">
            Masuk
          </Link>
        </p>
      </div>
    </div>
  );
}
