'use server'

import { createClient } from '@/lib/supabase/server';
import { analyzeHealthWithGemini } from './gemini/healthAssessment';

interface AssessmentInput {
    age: number;
    sex: 'Male' | 'Female';
    bmi: number;
    waist: number;
    systolic_bp: number;
    diastolic_bp: number;
    heart_rate: number;
    history: 'Yes' | 'None';
    total_cholesterol: number;
    ldl: number;
    hdl: number;
    triglycerides: number;
    fasting_glucose: number;
    hba1c: number;
    smoking: 'Non-Smoker' | 'Former Smoker' | 'Regular Smoker' | 'Heavy Smoker';
    activity: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active';
    stress: 'Low' | 'Moderate' | 'High';
    salt_intake: 'Low' | 'Medium' | 'High';
}

export async function analyzeHealth(input: AssessmentInput) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: 'Authentication required' };

    try {
        // 1. Run Gemini-based Health Assessment
        const result = await analyzeHealthWithGemini(input);
        if ('error' in result) return result;
        
        const geminiResults = result.data;

        // 2. Normalize results for DB Schema
        const normalizedProbs = {
            heart_disease: geminiResults["Heart Disease"].risk_percent / 100,
            hypertension: geminiResults["Hypertension"].risk_percent / 100,
            diabetes: geminiResults["Diabetes"].risk_percent / 100
        };

        const normalizedConf = {
            heart_disease: geminiResults["Heart Disease"].confidence / 100,
            hypertension: geminiResults["Hypertension"].confidence / 100,
            diabetes: geminiResults["Diabetes"].confidence / 100
        };

        const normalizedFactors = {
            heart_disease: geminiResults["Heart Disease"].top_risk_drivers.concat(geminiResults["Heart Disease"].protective_factors),
            hypertension: geminiResults["Hypertension"].top_risk_drivers.concat(geminiResults["Hypertension"].protective_factors),
            diabetes: geminiResults["Diabetes"].top_risk_drivers.concat(geminiResults["Diabetes"].protective_factors)
        };

        // Consolidate interpretation from Gemini output
        const interpretation = {
            summary: geminiResults["Heart Disease"].summary_paragraph,
            factors: geminiResults["Heart Disease"].top_risk_drivers.map((f: any) => f.feature),
            recommendations: geminiResults["Heart Disease"].recommendations,
            consultation_trigger: "Elevated risk detection in cardiovascular or metabolic screening."
        };
        
        // 3. Store in Supabase
        const { data, error: dbError } = await supabase
            .from('health_assessments')
            .insert({
                patient_id: user.id,
                inputs: input,
                probabilities: normalizedProbs,
                confidence_scores: normalizedConf,
                health_score: geminiResults.health_score,
                shap_values: normalizedFactors,
                explanation: interpretation,
                severity: determineSeverity(normalizedProbs)
            })
            .select()
            .single();

        if (dbError) throw dbError;

        return { data };

    } catch (error: any) {
        console.error('Assessment Error:', error);
        return { error: error.message || 'Failed to complete health assessment' };
    }
}

function determineSeverity(probs: any): string {
    const maxProb = Math.max(...Object.values(probs) as number[]);
    if (maxProb > 0.65) return 'critical';
    if (maxProb > 0.35) return 'warning';
    return 'normal';
}
