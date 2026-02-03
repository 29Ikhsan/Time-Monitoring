-- Menambahkan kolom subtasks (JSONB) ke tabel tasks
-- Defaultnya array kosong [] agar tidak null
ALTER TABLE tasks 
ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

-- Comment: Struktur data subtasks nantinya seperti ini:
-- [
--   { "id": "uuid...", "title": "Nama Subtask", "done": false },
--   { "id": "uuid...", "title": "Nama Subtask", "done": true }
-- ]
