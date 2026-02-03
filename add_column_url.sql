-- Menambahkan kolom link / URL eksternal ke tabel tasks (Aman dijalankan berulang)
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS external_url text;
