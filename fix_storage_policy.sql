-- Script ini untuk membuka izin Upload File ke Storage
-- Jalankan di SQL Editor Supabase

-- 1. Izinkan Upload (INSERT) untuk umum
create policy "Allow Public Uploads"
on storage.objects for insert
with check ( bucket_id = 'task-files' );

-- 2. Izinkan Melihat File (SELECT) untuk umum
create policy "Allow Public Downloads"
on storage.objects for select
using ( bucket_id = 'task-files' );

-- 3. (Opsional) Izinkan Update/Delete jika perlu
create policy "Allow Public Update"
on storage.objects for update
using ( bucket_id = 'task-files' );

create policy "Allow Public Delete"
on storage.objects for delete
using ( bucket_id = 'task-files' );
