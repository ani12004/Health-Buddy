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
  phone text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Doctors can view all profiles" on public.profiles for select using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor' );
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- =========================
-- PATIENTS TABLE
-- =========================
create table public.patients (
  id uuid not null references public.profiles(id) on delete cascade,
  dob date,
  blood_type text,
  allergies jsonb default '[]'::jsonb,
  conditions jsonb default '[]'::jsonb,
  height text,
  weight text,
  insurance_provider text,
  insurance_member_id text,
  insurance_plan text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  primary key (id)
);

alter table public.patients enable row level security;

create policy "Patient can view own data" on public.patients for select using (auth.uid() = id);
create policy "Doctor can view patients" on public.patients for select using ( (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor' );
create policy "Patient can update own data" on public.patients for update using (auth.uid() = id);
create policy "Patient can insert own data" on public.patients for insert with check (auth.uid() = id);

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

create policy "Doctor can view own data" on public.doctors for select using (auth.uid() = id);
create policy "Authenticated users can view doctors" on public.doctors for select using (auth.uid() is not null);
create policy "Doctor can update own data" on public.doctors for update using (auth.uid() = id);

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
  severity text check (severity in ('normal', 'critical', 'warning')) default 'normal',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_reports_patient on public.reports(patient_id);
create index idx_reports_doctor on public.reports(doctor_id);

alter table public.reports enable row level security;

create policy "Patient can view own reports" on public.reports for select using (auth.uid() = patient_id);
create policy "Doctor can view own created reports" on public.reports for select using (auth.uid() = doctor_id);
create policy "Doctor can insert reports" on public.reports for insert with check (auth.uid() = doctor_id and (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor');
create policy "Doctor can update own reports" on public.reports for update using (auth.uid() = doctor_id);

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

create policy "User can view own chats" on public.chats for select using (auth.uid() = user_id);
create policy "User can insert own chats" on public.chats for insert with check (auth.uid() = user_id);
create policy "User can delete own chats" on public.chats for delete using (auth.uid() = user_id);

-- =========================
-- APPOINTMENTS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    appointment_date timestamptz NOT NULL,
    status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'pending')) DEFAULT 'pending',
    type text NOT NULL,
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid() = patient_id);
CREATE POLICY "Doctors can update appointments" ON public.appointments FOR UPDATE USING (auth.uid() = doctor_id);

-- =========================
-- DAILY TIPS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.daily_tips (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    category text,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Everyone can read daily tips" ON public.daily_tips FOR SELECT USING (true);


-- =========================
-- PRESCRIPTIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.prescriptions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
    medication_name text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    start_date date NOT NULL,
    end_date date,
    status text CHECK (status IN ('active', 'completed', 'discontinued')) DEFAULT 'active',
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions FOR INSERT WITH CHECK ((auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor');

-- =========================
-- NOTIFICATIONS TABLE
-- =========================
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text NOT NULL,
    type text CHECK (type IN ('info', 'alert', 'success')) DEFAULT 'info',
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

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

-- =========================
-- SEED DATA
-- =========================
INSERT INTO public.daily_tips (title, content, category)
SELECT 'Stay Hydrated', 'Drinking water helps maintain focus and energy levels throughout the day. Aim for 8 glasses daily.', 'General'
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tips);

INSERT INTO public.daily_tips (title, content, category)
SELECT 'Take a Walk', 'Walking for 30 minutes a day can improve cardiovascular health and reduce stress.', 'Fitness'
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tips WHERE title = 'Take a Walk');
