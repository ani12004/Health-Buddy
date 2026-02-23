-- ==============================================================================
-- CLERK ID COMPATIBILITY MIGRATION (UUID -> TEXT) - REVISED BOOTSTRAP
-- Run this in your Supabase SQL Editor to support Clerk User IDs.
-- ==============================================================================

-- 1. DROP ALL TRIGGERS AND FUNCTIONS FIRST
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. DROP ALL POLICIES DYNAMICALLY
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON public.' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 3. DROP ALL FOREIGN KEYS DYNAMICALLY
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT constraint_name, table_name 
              FROM information_schema.table_constraints 
              WHERE constraint_type = 'FOREIGN KEY' AND table_schema = 'public') 
    LOOP
        EXECUTE 'ALTER TABLE public.' || quote_ident(r.table_name) || ' DROP CONSTRAINT IF EXISTS ' || quote_ident(r.constraint_name);
    END LOOP;
END $$;

-- 4. CONVERT ALL COLUMNS TO TEXT
-- Profiles
ALTER TABLE public.profiles ALTER COLUMN id TYPE text;
-- Patients
ALTER TABLE public.patients ALTER COLUMN id TYPE text;
-- Doctors
ALTER TABLE public.doctors ALTER COLUMN id TYPE text;
-- Reports
ALTER TABLE public.reports ALTER COLUMN patient_id TYPE text;
ALTER TABLE public.reports ALTER COLUMN doctor_id TYPE text;
ALTER TABLE public.reports ALTER COLUMN id TYPE text; -- Often id is uuid, changing to text for consistency if needed, but uuid is fine for non-user IDs. Let's keep PKs as text if they represent Clerk IDs. 
-- Appointments
ALTER TABLE public.appointments ALTER COLUMN patient_id TYPE text;
ALTER TABLE public.appointments ALTER COLUMN doctor_id TYPE text;
-- Prescriptions
ALTER TABLE public.prescriptions ALTER COLUMN patient_id TYPE text;
ALTER TABLE public.prescriptions ALTER COLUMN doctor_id TYPE text;
-- Notifications
ALTER TABLE public.notifications ALTER COLUMN user_id TYPE text;
-- Chats
ALTER TABLE public.chats ALTER COLUMN user_id TYPE text;

-- 5. RE-ESTABLISH INTERNAL FOREIGN KEYS (No reference to auth.users)
ALTER TABLE public.patients ADD CONSTRAINT patients_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.doctors ADD CONSTRAINT doctors_id_fkey FOREIGN KEY (id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD CONSTRAINT reports_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.reports ADD CONSTRAINT reports_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.appointments ADD CONSTRAINT appointments_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.prescriptions ADD CONSTRAINT prescriptions_patient_id_fkey FOREIGN KEY (patient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.prescriptions ADD CONSTRAINT prescriptions_doctor_id_fkey FOREIGN KEY (doctor_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
ALTER TABLE public.chats ADD CONSTRAINT chats_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- 6. RECREATE ALL POLICIES
-- Profiles
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Doctors can view all profiles" ON public.profiles FOR SELECT USING ((auth.jwt() -> 'publicMetadata' ->> 'role') = 'doctor');
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid()::text = id);
-- Patients
CREATE POLICY "Patient can view own data" ON public.patients FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Doctor can view patients" ON public.patients FOR SELECT USING ((auth.jwt() -> 'publicMetadata' ->> 'role') = 'doctor');
CREATE POLICY "Patient can update own data" ON public.patients FOR UPDATE USING (auth.uid()::text = id);
CREATE POLICY "Patient can insert own data" ON public.patients FOR INSERT WITH CHECK (auth.uid()::text = id);
-- Doctors
CREATE POLICY "Doctor can view own data" ON public.doctors FOR SELECT USING (auth.uid()::text = id);
CREATE POLICY "Authenticated users can view doctors" ON public.doctors FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "Doctor can update own data" ON public.doctors FOR UPDATE USING (auth.uid()::text = id);
-- Reports
CREATE POLICY "Patient can view own reports" ON public.reports FOR SELECT USING (auth.uid()::text = patient_id);
CREATE POLICY "Doctor can view own created reports" ON public.reports FOR SELECT USING (auth.uid()::text = doctor_id);
CREATE POLICY "Doctor can insert reports" ON public.reports FOR INSERT WITH CHECK (auth.uid()::text = doctor_id AND (auth.jwt() -> 'publicMetadata' ->> 'role') = 'doctor');
CREATE POLICY "Doctor can update own reports" ON public.reports FOR UPDATE USING (auth.uid()::text = doctor_id);
-- Chats
CREATE POLICY "User can view own chats" ON public.chats FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "User can insert own chats" ON public.chats FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "User can delete own chats" ON public.chats FOR DELETE USING (auth.uid()::text = user_id);
-- Appointments
CREATE POLICY "Users can view own appointments" ON public.appointments FOR SELECT USING (auth.uid()::text = patient_id OR auth.uid()::text = doctor_id);
CREATE POLICY "Patients can create appointments" ON public.appointments FOR INSERT WITH CHECK (auth.uid()::text = patient_id);
CREATE POLICY "Doctors can update appointments" ON public.appointments FOR UPDATE USING (auth.uid()::text = doctor_id);
-- Prescriptions
CREATE POLICY "Users can view own prescriptions" ON public.prescriptions FOR SELECT USING (auth.uid()::text = patient_id OR auth.uid()::text = doctor_id);
CREATE POLICY "Doctors can create prescriptions" ON public.prescriptions FOR INSERT WITH CHECK ((auth.jwt() -> 'publicMetadata' ->> 'role') = 'doctor');
-- Notifications
CREATE POLICY "Users can view own notifications" ON public.notifications FOR SELECT USING (auth.uid()::text = user_id);
CREATE POLICY "Users can update own notifications" ON public.notifications FOR UPDATE USING (auth.uid()::text = user_id);
