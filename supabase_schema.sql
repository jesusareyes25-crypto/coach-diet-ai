-- Create Clients Table
create table clients (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  age integer,
  weight numeric, -- kg
  height numeric, -- cm
  gender text,
  goal text,
  activity_level text,
  dietary_restrictions text,
  meals_per_day integer default 3
);

-- Create Diet Plans Table
create table diet_plans (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  client_id uuid references clients(id) on delete cascade not null,
  title text,
  daily_calories integer,
  content_json jsonb not null -- Stores the full diet structure
);

-- Enable Row Level Security (RLS)
alter table clients enable row level security;
alter table diet_plans enable row level security;

-- Policies (For V1 "Single Coach" mode, allow all operations for now to avoid Auth complexity immediately, otherwise we need Auth setup)
-- ideally we want: create policy "Public Access" on clients for all using (true);
create policy "Enable all access for all users" on clients for all using (true) with check (true);
create policy "Enable all access for all users" on diet_plans for all using (true) with check (true);
