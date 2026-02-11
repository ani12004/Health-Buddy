-- ==============================================================================
-- MASTER SCHEMA UPDATE SCRIPT
-- Run this in your Supabase SQL Editor to enable all new features.
-- ==============================================================================

-- 1. Add 'severity' to 'reports' table if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reports' AND column_name = 'severity') THEN
        ALTER TABLE public.reports ADD COLUMN severity text check (severity in ('normal', 'critical', 'warning')) default 'normal';
    END IF;
END $$;

-- 2. Add 'phone' to 'profiles' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'phone') THEN
        ALTER TABLE public.profiles ADD COLUMN phone text;
    END IF;
END $$;

-- 3. Add height, weight, insurance details to 'patients' table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'height') THEN
        ALTER TABLE public.patients ADD COLUMN height text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'weight') THEN
        ALTER TABLE public.patients ADD COLUMN weight text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'insurance_provider') THEN
        ALTER TABLE public.patients ADD COLUMN insurance_provider text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'insurance_member_id') THEN
        ALTER TABLE public.patients ADD COLUMN insurance_member_id text;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'patients' AND column_name = 'insurance_plan') THEN
        ALTER TABLE public.patients ADD COLUMN insurance_plan text;
    END IF;
END $$;

-- 4. Create 'appointments' table
CREATE TABLE IF NOT EXISTS public.appointments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    doctor_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL, -- Optional if not assigned yet
    appointment_date timestamptz NOT NULL,
    status text NOT NULL CHECK (status IN ('scheduled', 'completed', 'cancelled', 'pending')) DEFAULT 'pending',
    type text NOT NULL, -- e.g., 'General Checkup', 'Specialist'
    notes text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS for Appointments
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own appointments" ON public.appointments
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Patients can create appointments" ON public.appointments
    FOR INSERT WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can update appointments" ON public.appointments
    FOR UPDATE USING (auth.uid() = doctor_id);

-- 5. Create 'daily_tips' table
CREATE TABLE IF NOT EXISTS public.daily_tips (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    title text NOT NULL,
    content text NOT NULL,
    category text,
    created_at timestamptz DEFAULT now()
);

-- RLS for Daily Tips (Public read, Admin write)
ALTER TABLE public.daily_tips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Everyone can read daily tips" ON public.daily_tips
    FOR SELECT USING (true);

-- 6. Create 'prescriptions' table
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

-- RLS for Prescriptions
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own prescriptions" ON public.prescriptions
    FOR SELECT USING (auth.uid() = patient_id OR auth.uid() = doctor_id);

CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions
    FOR INSERT WITH CHECK (
        (auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor'
    );

-- 7. Create 'notifications' table
CREATE TABLE IF NOT EXISTS public.notifications (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    message text NOT NULL,
    type text CHECK (type IN ('info', 'alert', 'success')) DEFAULT 'info',
    is_read boolean DEFAULT false,
    created_at timestamptz DEFAULT now()
);

-- RLS for Notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Seed some initial data for visual verification (Optional but helpful)
-- Daily Tips
INSERT INTO public.daily_tips (title, content, category)
SELECT 'Stay Hydrated', 'Drinking water helps maintain focus and energy levels throughout the day. Aim for 8 glasses daily.', 'General'
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tips);

INSERT INTO public.daily_tips (title, content, category)
SELECT 'Take a Walk', 'Walking for 30 minutes a day can improve cardiovascular health and reduce stress.', 'Fitness'
WHERE NOT EXISTS (SELECT 1 FROM public.daily_tips WHERE title = 'Take a Walk');
