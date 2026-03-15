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

        // 2. Run Gemini Interpreter
        const interpretation = await getGeminiInterpretation(input, mlResults);
        
        // 3. Store in Supabase
        const { data, error: dbError } = await supabase
            .from('health_assessments')
            .insert({
                patient_id: user.id,
                inputs: input,
                probabilities: mlResults.probabilities,
                confidence_scores: mlResults.confidence,
                health_score: mlResults.health_score,
                shap_values: mlResults.shap,
                explanation: interpretation,
                severity: determineSeverity(mlResults.probabilities)
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

async function getGeminiInterpretation(input: any, mlResults: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('Gemini API Key missing');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const prompt = `
    Act as a senior medical AI consultant. Interpret the following ML risk predictions for a patient.
    
    ### Patient Context:
    - Age: ${input.age}, Sex: ${input.sex}, BMI: ${input.bmi}
    - BP: ${input.systolic_bp}/${input.diastolic_bp}
    - History: ${input.history}, Activity: ${input.activity}
    
    ### ML Risk Scores:
    - Heart Disease Risk: ${(mlResults.probabilities.heart_disease * 100).toFixed(1)}%
    - Hypertension Risk: ${(mlResults.probabilities.hypertension * 100).toFixed(1)}%
    - Unified Health Score: ${mlResults.health_score}/100 (100 is best)
    
    ### Task:
    Explain these results in human terms. Focus on why the risks are at this level based on their metrics.
    
    Return strictly valid JSON in this format:
    {
        "summary": "Concise overview (2-3 sentences)",
        "factors": ["Factor 1: Brief explanation", "Factor 2..."],
        "recommendations": ["Actionable step 1", "Actionable step 2..."],
        "consultation_trigger": "Specific condition or symptom when they MUST see a doctor."
    }
    
    Respond ONLY with raw JSON.
    `;

    const result = await model.generateContent(prompt);
    return JSON.parse(result.response.text().replace(/```json|```/g, ''));
}

function determineSeverity(probs: any): string {
    const maxProb = Math.max(...Object.values(probs) as number[]);
    if (maxProb > 0.7) return 'critical';
    if (maxProb > 0.4) return 'warning';
    return 'normal';
}
