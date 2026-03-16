-- ==================================================
-- ML FEEDBACK SYSTEM
-- ==================================================

CREATE TABLE IF NOT EXISTS public.ml_feedback (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    assessment_id uuid REFERENCES public.health_assessments(id) ON DELETE CASCADE,
    patient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Feedback Metrics
    rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment text,
    
    -- Metadata
    created_at timestamptz DEFAULT now()
);

-- Indices for faster lookup
CREATE INDEX IF NOT EXISTS idx_ml_feedback_patient ON public.ml_feedback(patient_id);
CREATE INDEX IF NOT EXISTS idx_ml_feedback_assessment ON public.ml_feedback(assessment_id);

-- RLS Policies
ALTER TABLE public.ml_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback" 
ON public.ml_feedback FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own feedback" 
ON public.ml_feedback FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient feedback" 
ON public.ml_feedback FOR SELECT 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor');
