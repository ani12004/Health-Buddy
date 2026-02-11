-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =========================
-- PROFILES TABLE
-- =========================
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  role text not null check (role in ('patient', 'doctor')),
  full_name text,
  avatar_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

-- Users can view own profile
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Doctors can view all profiles
create policy "Doctors can view all profiles"
  on public.profiles for select
  using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor' );

-- Users can update own profile
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- =========================
-- PATIENTS TABLE
-- =========================
create table public.patients (
  id uuid not null references public.profiles(id) on delete cascade,
  dob date,
  blood_type text,
  allergies jsonb default '[]'::jsonb,
  conditions jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.patients enable row level security;

-- Patient can view own record
create policy "Patient can view own data"
  on public.patients for select
  using (auth.uid() = id);

-- Doctor can view patients
create policy "Doctor can view patients"
  on public.patients for select
  using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor' );

-- Patient can update own record
create policy "Patient can update own data"
  on public.patients for update
  using (auth.uid() = id);

-- Patient can insert own record (New)
create policy "Patient can insert own data"
  on public.patients for insert
  with check (auth.uid() = id);

-- =========================
-- DOCTORS TABLE
-- =========================
create table public.doctors (
  id uuid not null references public.profiles(id) on delete cascade,
  specialty text,
  license_number text,
  hospital_affiliation text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.doctors enable row level security;

-- Doctor can view own record
create policy "Doctor can view own data"
  on public.doctors for select
  using (auth.uid() = id);

-- Everyone authenticated can view doctors
create policy "Authenticated users can view doctors"
  on public.doctors for select
  using (auth.uid() is not null);

-- Doctor can update own record
create policy "Doctor can update own data"
  on public.doctors for update
  using (auth.uid() = id);

-- =========================
-- REPORTS TABLE
-- =========================
create table public.reports (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid not null references public.profiles(id) on delete cascade,
  doctor_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  type text not null,
  content jsonb,
  file_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_reports_patient on public.reports(patient_id);
create index idx_reports_doctor on public.reports(doctor_id);

alter table public.reports enable row level security;

-- Patient can view own reports
create policy "Patient can view own reports"
  on public.reports for select
  using (auth.uid() = patient_id);

-- Doctor can view reports they created
create policy "Doctor can view own created reports"
  on public.reports for select
  using (auth.uid() = doctor_id);

-- Doctor can insert reports
create policy "Doctor can insert reports"
  on public.reports for insert
  with check (
    auth.uid() = doctor_id and
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor'
  );

-- Doctor can update own reports
create policy "Doctor can update own reports"
  on public.reports for update
  using (auth.uid() = doctor_id);

-- =========================
-- CHATS TABLE
-- =========================
create table public.chats (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_id uuid not null,
  sender text not null check (sender in ('user', 'ai')),
  message text not null,
  created_at timestamptz default now()
);

create index idx_chats_user on public.chats(user_id);
create index idx_chats_session on public.chats(session_id);

alter table public.chats enable row level security;

-- User can view own chats
create policy "User can view own chats"
  on public.chats for select
  using (auth.uid() = user_id);

-- User can insert own chats
create policy "User can insert own chats"
  on public.chats for insert
  with check (auth.uid() = user_id);

-- User can delete own chats (New)
create policy "User can delete own chats"
  on public.chats for delete
  using (auth.uid() = user_id);

-- =========================
-- AUTO PROFILE CREATION FUNCTION
-- =========================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, role, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'patient'),
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );

  if (new.raw_user_meta_data->>'role' = 'doctor') then
    insert into public.doctors (id) values (new.id);
  else
    insert into public.patients (id) values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
