-- Migration: Seed Additional Gamification Badges & Catalog Defaults
-- Date: 2026-09-15

INSERT INTO public.badges (id, title, description, icon, xp_reward) VALUES
  ('ten_logs', 'Langkah Pertama', 'Berhasil mencatat 10 transaksi di Story Finance', 'target', 50),
  ('half_century', 'Konsistensi 50 Log', 'Berhasil mencatat 50 transaksi secara akumulatif', 'sparkles', 100),
  ('century_club', 'Kolektor 100 Log', 'Mencapai rekor pencatatan 100 transaksi', 'layers', 250),
  ('income_logger', 'Pencatat Rezeki', 'Mencatat transaksi pemasukan pertama Anda', 'trending-up', 50),
  ('budget_builder', 'Arsitek Anggaran', 'Mengatur batas anggaran kategori pertama kali', 'pie-chart', 75),
  ('streak_14', 'Pejuang 2 Minggu', 'Konsisten mencatat keuangan selama 14 hari berturut-turut', 'flame', 200)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  xp_reward = EXCLUDED.xp_reward;
