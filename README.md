# Story Finance 🪙

Aplikasi pencatat keuangan harian (*cashflow tracker*) berbasis **PWA (Progressive Web App)** yang dirancang dengan pendekatan *mobile-first*. Menggabungkan metode *envelope budgeting*, alokasi *Self-Reward* yang aman dari rasa bersalah (*guilt-free*), serta elemen gamifikasi retro 8-bit agar mencatat pengeluaran jadi rutinitas yang konsisten dan menyenangkan.

---

## ✨ Fitur Utama

- **⚡ Pencatatan Cepat (Fast Entry)**  
  Modal pencatatan instan dengan numpad sentuh, pemilihan kategori cepat, input nominal, tanggal, dan catatan pengeluaran/pemasukan.

- **📜 Histori & Filter Transaksi**  
  Pantau riwayat keuangan bulanan lengkap dengan filter kategori, pencarian transaksi, serta fitur edit dan hapus catatan.

- **🎯 Envelope Budgeting & Self-Reward**  
  Atur batas anggaran per kategori dalam mode nominal tetap (*fixed*) atau persentase dari pemasukan. Dilengkapi meteran alokasi **Self-Reward** agar kamu tetap bisa menikmati hasil kerja keras tanpa khawatir melebihi anggaran (*overbudget*).

- **🎮 Gamifikasi Retro 8-Bit**  
  - **Level 1 – 20 (Tier Bronze hingga Immortal)**: Naik level dan raih title baru setiap kali mencatat transaksi.
  - **Efek Border Avatar Dinamis**: Bingkai avatar profil berevolusi mengikuti tier rank akun kamu.
  - **Streak Harian**: Jaga api streak tetap menyala dengan bonus pengganda XP (x2) setelah 7 hari berturut-turut.
  - **12 Lencana Pencapaian (Badges)**: Buka achievement dari milestone pencatatan, disiplin budget, hingga rekor streak.

- **📱 PWA & Offline-First**  
  - Dapat di-install langsung di layar utama HP (Android & iOS).
  - Tetap bisa mencatat saat koneksi internet terputus berkat antrean lokal IndexedDB, dan otomatis tersinkronisasi saat kembali online.

- **🔔 Pengingat Harian (Web Push Notification)**  
  Notifikasi santai setiap jam 20:00 WIB di status bar HP kamu jika belum ada transaksi yang dicatat hari itu. Otomatis dilewati jika kamu sudah mencatat.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, Server Actions)
- **Bahasa**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Lucide Icons](https://lucide.dev/)
- **Database & Auth**: [Supabase](https://supabase.com/) (PostgreSQL & Row Level Security)
- **Offline Storage**: IndexedDB via [idb-keyval](https://github.com/jakearchibald/idb-keyval)
- **Push Notification**: Web Push API ([web-push](https://github.com/web-push-libs/web-push) + VAPID)
- **Scheduler**: Vercel Cron
- **Hosting**: [Vercel](https://vercel.com/)

---

## 🚀 Memulai (Local Development)

### 1. Clone Repository
```bash
git clone https://github.com/yourLogic01/story-finance.git
cd story-finance
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu lengkapi variabel berikut:
```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
VAPID_SUBJECT=mailto:admin@story-finance.com

# Vercel Cron Secret (Opsional)
CRON_SECRET=your_cron_secret
```

### 4. Eksekusi Migrasi Database
Jalankan file SQL berikut di **Supabase SQL Editor** sesuai urutan:
1. `supabase/migrations/20260915000000_initial_schema.sql` (Tabel, Relasi & RLS)
2. `supabase/migrations/20260915000001_seed_defaults.sql` (Kategori Default & Master Badges)
3. `supabase/migrations/20260916000000_push_notifications.sql` (Push Subscriptions & Preferensi)

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka peramban di [http://localhost:3000](http://localhost:3000).

---

## 🧪 Skrip Perintah

- `npm run dev` : Menjalankan server lokal pengembangan.
- `npm run build` : Membangun aplikasi untuk produksi.
- `npm run start` : Menjalankan server build produksi.
- `npm run lint` : Memeriksa kualitas kode dengan ESLint.
- `npm run typecheck` : Memverifikasi ketepatan tipe TypeScript tanpa kompilasi.

---

## 📄 Lisensi
Proyek ini dibuat untuk keperluan pribadi dan pembelajaran di bawah lisensi MIT.
