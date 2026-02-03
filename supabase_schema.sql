-- 1. Buat Tabel Tasks
create table tasks (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default now(),
  title text not null,
  description text,
  assignee text,
  priority text,
  status text,
  month_period text,
  started_at timestamp with time zone,
  finished_at timestamp with time zone,
  attachments jsonb default '[]'::jsonb
);

-- 2. Aktifkan RLS (Row Level Security) - Opsional tapi disarankan
alter table tasks enable row level security;

-- 3. Policy agar SEMUA orang (public) bisa baca/tulis (Mode Development)
create policy "Public Access" 
on tasks for all 
using (true) 
with check (true);
