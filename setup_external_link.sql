-- STEP 1: HAPUS SEMUA KODE DI SQL EDITOR SEBELUM PASTE KODE INI
-- STEP 2: PASTE DAN KLIK RUN

ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS external_url text;

NOTIFY pgrst, 'reload config';

SELECT 'SUKSES! Kolom external_url berhasil ditambahkan.' as status;
