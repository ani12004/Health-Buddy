-- ==========================================
-- Health Buddy Database Schema
-- ==========================================

-- -----------------------------------------------------------------------------
-- 1. Shared Profiles Table (Base Info for All Users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid not null references auth.users on delete cascade,
  email text,
  role text check (role in ('patient', 'doctor')),
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (id)
);

-- RLS: Users can read/update their own profile
alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" 
  on public.profiles for select 
  using ( auth.uid() = id );

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" 
  on public.profiles for update 
  using ( auth.uid() = id );


-- -----------------------------------------------------------------------------
-- 2. Patients Table (Specific to Patients)
-- -----------------------------------------------------------------------------
create table if not exists public.patients (
  id uuid not null references public.profiles(id) on delete cascade,
  date_of_birth date,
  medical_history text,
  allergies text[], 
  current_medications text[],
  blood_type text,
  height_cm numeric,
  weight_kg numeric,
  primary key (id)
);

-- RLS: Patients can read/update their own data. Doctors can read patient data.
alter table public.patients enable row level security;

drop policy if exists "Patients read/write own data" on public.patients;
create policy "Patients read/write own data" 
  on public.patients for all 
  using ( auth.uid() = id );

drop policy if exists "Doctors view all patients" on public.patients;
create policy "Doctors view all patients" 
  on public.patients for select 
  using ( 
    exists ( select 1 from public.profiles where id = auth.uid() and role = 'doctor' ) 
  );


-- -----------------------------------------------------------------------------
-- 3. Doctors Table (Specific to Doctors)
-- -----------------------------------------------------------------------------
create table if not exists public.doctors (
  id uuid not null references public.profiles(id) on delete cascade,
  specialization text,
  license_number text,
  hospital_affiliation text,
  years_of_experience integer,
  available_hours jsonb, -- e.g. {"mon": "9-5", "tue": "9-5"}
  primary key (id)
);

-- RLS: Doctors read/write own data. Patients can view basic doctor info.
alter table public.doctors enable row level security;

drop policy if exists "Doctors read/write own data" on public.doctors;
create policy "Doctors read/write own data" 
  on public.doctors for all 
  using ( auth.uid() = id );

drop policy if exists "Public view doctors" on public.doctors;
create policy "Public view doctors" 
  on public.doctors for select 
  using ( true );


-- -----------------------------------------------------------------------------
-- 4. Automation Trigger
--    Function to handle new user signup and create rows in respective tables
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  -- 1. Determine Role (default to patient if missing)
  user_role := coalesce(new.raw_user_meta_data->>'role', 'patient');

  -- 2. Insert into Base Profiles
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    user_role,
    new.raw_user_meta_data->>'full_name'
  );

  -- 3. Insert into Specific Table based on Role
  if user_role = 'patient' then
    insert into public.patients (id) values (new.id);
  elsif user_role = 'doctor' then
    insert into public.doctors (id) values (new.id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger setup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- -----------------------------------------------------------------------------
-- 5. Permissions
-- -----------------------------------------------------------------------------
grant usage on schema public to postgres, anon, authenticated, service_role;
grant all on all tables in schema public to postgres, anon, authenticated, service_role;
grant all on all functions in schema public to postgres, anon, authenticated, service_role;
grant all on all sequences in schema public to postgres, anon, authenticated, service_role;


-- =============================================================================
-- 6. Profile & Settings 2.0 Updates
--    Added on: 2026-01-19
-- =============================================================================

-- A. Update Patients Table
alter table public.patients 
add column if not exists name text, -- Explicit role-specific name
add column if not exists phone text,
add column if not exists emergency_contact jsonb, -- { name, relation, phone }
add column if not exists preferred_language text,
add column if not exists conditions text[];

-- B. Update Doctors Table
alter table public.doctors
add column if not exists name text, -- Explicit role-specific name
add column if not exists bio text,
add column if not exists languages_spoken text[],
add column if not exists verified_at timestamp with time zone;

-- C. Create User Settings Table
create table if not exists public.user_settings (
  id uuid not null references public.profiles(id) on delete cascade,
  ai_enabled boolean default true,
  ai_detail_level text check (ai_detail_level in ('concise', 'detailed')) default 'concise',
  notifications_email boolean default true,
  notifications_push boolean default true,
  theme_preference text default 'system',
  primary key (id)
);

-- RLS for User Settings
alter table public.user_settings enable row level security;

drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings" 
  on public.user_settings for all 
  using ( auth.uid() = id );

-- D. Update Trigger to Initialize Settings
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_role text;
begin
  -- 1. Determine Role (default to patient if missing)
  user_role := coalesce(new.raw_user_meta_data->>'role', 'patient');

  -- 2. Insert into Base Profiles
  insert into public.profiles (id, email, role, full_name)
  values (
    new.id,
    new.email,
    user_role,
    new.raw_user_meta_data->>'full_name'
  );

  -- 3. Insert into Specific Table based on Role
  if user_role = 'patient' then
    insert into public.patients (id) values (new.id);
  elsif user_role = 'doctor' then
    insert into public.doctors (id) values (new.id);
  end if;

  -- 4. Initialize User Settings
  insert into public.user_settings (id) values (new.id);

  return new;
end;
$$ language plpgsql security definer;
