-- Paksa Refresh Schema Cache dengan reload config (opsional tapi membantu)
NOTIFY pgrst, 'reload config';

-- Tambahkan kolom external_url jika belum ada
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS external_url text;

-- Pastikan kolom bisa diakses (biasanya otomatis, tapi untuk jaga-jaga)
GRANT ALL ON TABLE public.tasks TO anon;
GRANT ALL ON TABLE public.tasks TO authenticated;
GRANT ALL ON TABLE public.tasks TO service_role;
