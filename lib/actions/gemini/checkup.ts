'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { runMLBridge } from '../ml/bridge'

export async function analyzeHealthData(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
        // 1. Run ML Bridge
        const mlInput = {
            age: Number(data.age) || 40,
            sex: data.sex || 'Male',
            bmi: Number(data.bmi) || 25,
            waist: Number(data.waist_circumference) || (data.sex === 'Female' ? 80 : 90),
            systolic_bp: Number(data.systolic_bp) || 120,
            diastolic_bp: Number(data.diastolic_bp) || 80,
            heart_rate: Number(data.resting_heart_rate) || 72,
            history: (data.heart_disease || data.hypertension || data.family_history_heart === 'Yes') ? 'Yes' : 'None',
            total_cholesterol: Number(data.total_cholesterol) || 200,
            ldl: Number(data.ldl) || 130,
            hdl: Number(data.hdl) || 50,
            triglycerides: Number(data.triglycerides) || 150,
            fasting_glucose: Number(data.fasting_glucose) || 95,
            hba1c: Number(data.hba1c) || 5.4,
            smoking: data.smoker === 'Yes' ? 'Regular Smoker' : data.smoker === 'Former' ? 'Former Smoker' : 'Non-Smoker',
            activity: data.physical_activity_level === 'Active' ? 'Very Active' : data.physical_activity_level,
            stress: data.stress_level === 'Moderate' ? 'Moderate' : data.stress_level,
            salt_intake: data.salt_intake === 'Moderate' ? 'Medium' : data.salt_intake
        };

        const mlResults = await runMLBridge(mlInput);
        if ('error' in mlResults) return mlResults;

        // 2. Format Data for UI (page.tsx expectations)
        const uiOutput = {
            overallAssessment: mlResults["Heart Disease"]?.summary_paragraph || 'Analysis complete. Please review your risk factors below.',
            predictions: [
                {
                    disease: 'Heart Disease',
                    probability: `${(mlResults["Heart Disease"]?.risk_percent || 0).toFixed(1)}%`,
                    riskLevel: mlResults["Heart Disease"]?.risk_level === 'HIGH' ? 'High' : 
                               mlResults["Heart Disease"]?.risk_level === 'MODERATE' ? 'Medium' : 'Low',
                    reasoning: mlResults["Heart Disease"]?.card_text || 'Calculated based on your cardiovascular markers.'
                },
                {
                    disease: 'Hypertension',
                    probability: `${(mlResults["Hypertension"]?.risk_percent || 0).toFixed(1)}%`,
                    riskLevel: mlResults["Hypertension"]?.risk_level === 'HIGH' ? 'High' : 
                               mlResults["Hypertension"]?.risk_level === 'MODERATE' ? 'Medium' : 'Low',
                    reasoning: mlResults["Hypertension"]?.card_text || 'Calculated based on your blood pressure and metabolic data.'
                },
                {
                    disease: 'Diabetes',
                    probability: `${(mlResults["Diabetes"]?.risk_percent || 0).toFixed(1)}%`,
                    riskLevel: mlResults["Diabetes"]?.risk_level === 'HIGH' ? 'High' : 
                               mlResults["Diabetes"]?.risk_level === 'MODERATE' ? 'Medium' : 'Low',
                    reasoning: mlResults["Diabetes"]?.card_text || 'Calculated based on your glucose and HbA1c levels.'
                }
            ],
            suggestions: mlResults["Heart Disease"]?.recommendations || [],
            disclaimer: "Disclaimer: This AI health assessment uses a machine learning ensemble trained on clinical data. It is for informational purposes only and not a substitute for professional medical advice. If you have critical readings (marked in red), please consult a physician immediately."
        };

        // 3. Persist Full Report for History/PDF
        if (user) {
            const severity = (
                mlResults["Heart Disease"]?.risk_level === 'HIGH' || 
                mlResults["Hypertension"]?.risk_level === 'HIGH' || 
                mlResults["Diabetes"]?.risk_level === 'HIGH'
            ) ? 'critical' : 'normal';

            const { data: assessment, error: aError } = await supabase
                .from('health_assessments')
                .insert({
                    patient_id: user.id,
                    inputs: mlInput,
                    probabilities: {
                        heart_disease: (mlResults["Heart Disease"]?.risk_percent || 0) / 100,
                        hypertension: (mlResults["Hypertension"]?.risk_percent || 0) / 100,
                        diabetes: (mlResults["Diabetes"]?.risk_percent || 0) / 100
                    },
                    health_score: mlResults.health_score || 85,
                    explanation: {
                        summary: mlResults["Heart Disease"]?.summary_paragraph,
                        recommendations: mlResults["Heart Disease"]?.recommendations,
                        flags: mlResults["Heart Disease"]?.clinical_flags
                    },
                    severity: severity
                })
                .select()
                .single();

            if (assessment) {
                await supabase
                    .from('reports')
                    .insert({
                        patient_id: user.id,
                        assessment_id: assessment.id,
                        title: 'AI Health Risk Assessment',
                        type: 'ai-checkup',
                        summary: mlResults["Heart Disease"]?.summary_paragraph || 'AI Clinical assessment complete.',
                        content: {
                            ...uiOutput,
                            ml_raw: mlResults,
                            patient_name: user?.user_metadata?.full_name || 'Patient'
                        }, 
                        severity: severity,
                        status: 'generated'
                    });
            }
        }

        return { data: uiOutput }

    } catch (error: any) {
        console.error('Checkup Error:', error)
        return { error: 'Failed to analyze health data. Please ensure all fields are filled correctly.' }
    }
}

export async function getReportPDFData(reportId: string) {
    const supabase = await createClient();
    
    // Fetch report with patient and assessment data
    const { data: report, error } = await supabase
        .from('reports')
        .select(`
            *,
            patient:patient_id(*),
            assessment:assessment_id(*)
        `)
        .eq('id', reportId)
        .single();

    if (error || !report) {
        console.error('getReportPDFData Error:', error);
        return null;
    }

    const patient = report.patient;
    const assessment = report.assessment;
    const content = report.content || {};

    const scaleProb = (v: any) => {
        const val = parseFloat(v);
        if (isNaN(val)) return 0;
        return val <= 1 ? val * 100 : val;
    };

    // Standardize data for Python template
    return {
        patient: patient?.full_name || content.patient_name || 'Patient',
        email: patient?.email || '',
        report_id: report.id.substring(0, 8),
        date: new Date(report.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        }),
        severity: report.severity || 'normal',
        health_score: report.health_score || assessment?.health_score || 0,
        probs: {
            'Heart Disease': scaleProb(assessment?.probabilities?.heart_disease || content.ml_raw?.["Heart Disease"]?.risk_percent),
            'Hypertension': scaleProb(assessment?.probabilities?.hypertension || content.ml_raw?.["Hypertension"]?.risk_percent),
            'Diabetes': scaleProb(assessment?.probabilities?.diabetes || content.ml_raw?.["Diabetes"]?.risk_percent)
        },
        conf: {
            'Score Confidence': scaleProb(assessment?.confidence_scores?.heart_disease || content.ml_raw?.["Heart Disease"]?.confidence || 0.95)
        },
        inputs: assessment?.inputs ? Object.entries(assessment.inputs).map(([k, v]) => [
            k.replace('_', ' ').toUpperCase(), v, 'normal'
        ]) : content.inputs || [],
        factors: assessment?.explanation?.summary ? [assessment.explanation.summary] : (content.overallAssessment ? [content.overallAssessment] : []),
        recs: (assessment?.explanation?.recommendations || content.suggestions || []).map((r: any) => {
           if (typeof r === 'string') return ['HIGH', r];
           return [r.priority || 'HIGH', (r.title || '') + (r.body ? ": " + r.body : "")];
        }),
        summary: report.summary || assessment?.explanation?.summary || content.overallAssessment || "Clinical assessment complete.",
        emergency: content.disclaimer || "Seek immediate medical attention for acute symptoms.",
        shap: assessment?.shap_values ? Object.entries(assessment.shap_values).flatMap(([disease, drivers]: [string, any]) => 
            drivers.map((d: any) => [d.feature, disease.replace('_', ' ').toUpperCase(), d.shap, d.shap > 0])
        ) : (content.ml_raw?.["Heart Disease"]?.top_risk_drivers || []).map((d: any) => [d.feature, 'HEART DISEASE', d.shap, d.shap > 0])
    };
}
