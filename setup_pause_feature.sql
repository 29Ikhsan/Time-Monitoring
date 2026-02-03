-- Menambahkan kolom untuk fitur Pause
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_paused boolean DEFAULT false;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS paused_at timestamptz;
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS elapsed_pause_ms bigint DEFAULT 0;

-- Refresh Cache
NOTIFY pgrst, 'reload config';

SELECT 'BERHASIL! Fitur Pause siap digunakan.' as status;
