'use server'

import { spawn } from 'child_process';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { createClient } from '@/lib/supabase/server';
import { runMLBridge } from './ml/bridge';

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
        // 1. Run ML Bridge
        const mlResults = await runMLBridge(input);
        if ('error' in mlResults) return mlResults;

        // 2. Map ML Results to DB Schema
        // Normalize keys for internal use
        const normalizedProbs = {
            heart_disease: mlResults["Heart Disease"].risk_percent / 100,
            hypertension: mlResults["Hypertension"].risk_percent / 100,
            diabetes: mlResults["Diabetes"].risk_percent / 100
        };

        const normalizedConf = {
            heart_disease: mlResults["Heart Disease"].confidence / 100,
            hypertension: mlResults["Hypertension"].confidence / 100,
            diabetes: mlResults["Diabetes"].confidence / 100
        };

        const normalizedShap = {
            heart_disease: mlResults["Heart Disease"].top_risk_drivers.concat(mlResults["Heart Disease"].protective_factors),
            hypertension: mlResults["Hypertension"].top_risk_drivers.concat(mlResults["Hypertension"].protective_factors),
            diabetes: mlResults["Diabetes"].top_risk_drivers.concat(mlResults["Diabetes"].protective_factors)
        };

        // Consolidate interpretation from ML output
        const interpretation = {
            summary: mlResults["Heart Disease"].summary_paragraph, // Using Heart Disease as primary summary
            factors: mlResults["Heart Disease"].clinical_flags.map((f: any) => f.message),
            recommendations: mlResults["Heart Disease"].recommendations,
            consultation_trigger: "High risk detection in cardiovascular or metabolic screening."
        };
        
        // 3. Store in Supabase
        const { data, error: dbError } = await supabase
            .from('health_assessments')
            .insert({
                patient_id: user.id,
                inputs: input,
                probabilities: normalizedProbs,
                confidence_scores: normalizedConf,
                health_score: mlResults.health_score,
                shap_values: normalizedShap,
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
