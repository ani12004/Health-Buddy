-- ==================================================
-- ADVANCED HEALTH ASSESSMENTS SCHEMA
-- ==================================================

CREATE TABLE IF NOT EXISTS public.health_assessments (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    patient_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
    
    -- Input Health Metrics
    inputs jsonb NOT NULL,
    
    -- ML Model Outputs
    probabilities jsonb NOT NULL, -- {heart_disease: float, hypertension: float}
    confidence_scores jsonb, -- {heart_disease: float, hypertension: float}
    health_score integer, -- 0-100 (Higher is healthier)
    shap_values jsonb, -- Feature contributions for explainability
    
    -- AI Interpretation (Gemini Layer 2)
    explanation jsonb, -- {summary, factors[], recommendations[], consultation_trigger}
    
    -- Metadata
    severity text CHECK (severity IN ('normal', 'warning', 'critical')) DEFAULT 'normal',
    created_at timestamptz DEFAULT now()
);

-- Indices for faster lookup
CREATE INDEX IF NOT EXISTS idx_health_assessments_patient ON public.health_assessments(patient_id);
CREATE INDEX IF NOT EXISTS idx_health_assessments_created ON public.health_assessments(created_at DESC);

-- RLS Policies
ALTER TABLE public.health_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own health assessments" 
ON public.health_assessments FOR SELECT 
USING (auth.uid() = patient_id);

CREATE POLICY "Users can insert own health assessments" 
ON public.health_assessments FOR INSERT 
WITH CHECK (auth.uid() = patient_id);

CREATE POLICY "Doctors can view patient health assessments" 
ON public.health_assessments FOR SELECT 
USING ((auth.jwt() -> 'user_metadata' ->> 'role') = 'doctor');
