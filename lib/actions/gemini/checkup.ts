'use server'

import { createClient } from '@/lib/supabase/server'
import { runMLBridge } from '../ml/bridge'

// Helper functions to map form values to ML model expected values
function mapSmoking(smoker: string): string {
    switch (smoker) {
        case 'Yes':
            return 'Regular Smoker'
        case 'Former':
            return 'Former Smoker'
        case 'No':
        default:
            return 'Non-Smoker'
    }
}

function mapActivity(activity: string): string {
    switch (activity) {
        case 'Light':
            return 'Light'
        case 'Moderate':
        case 'Moderately Active':
            return 'Moderate'
        case 'Active':
            return 'Active'
        case 'Very Active':
            return 'Very Active'
        case 'Sedentary':
        default:
            return 'Sedentary'
    }
}

function mapStress(stress: string): string {
    switch (stress) {
        case 'Low':
            return 'Low'
        case 'Moderate':
        case 'Medium':
            return 'Moderate'
        case 'High':
            return 'High'
        default:
            return 'Moderate'
    }
}

function mapSaltIntake(salt: string): string {
    switch (salt) {
        case 'Low':
            return 'Low'
        case 'Medium':
        case 'Moderate':
            return 'Medium'
        case 'High':
            return 'High'
        default:
            return 'Medium'
    }
}

export async function analyzeHealthData(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    try {
        // 1. Run ML Bridge
        // Map form field names to ML input field names
        const mlInput = {
            age: Number(data.age) || 40,
            sex: data.sex || 'Male',
            bmi: Number(data.bmi) || 25,
            waist: Number(data.waist_circumference) || (data.sex === 'Female' ? 80 : 90),
            systolic_bp: Number(data.systolic_bp) || 120,
            diastolic_bp: Number(data.diastolic_bp) || 80,
            heart_rate: Number(data.resting_heart_rate) || 72,
            history: (data.heart_disease || data.hypertension) ? 'Yes' : 'None',
            total_cholesterol: Number(data.total_cholesterol) || 200,
            ldl: Number(data.ldl) || 130,
            hdl: Number(data.hdl) || 50,
            triglycerides: Number(data.triglycerides) || 150,
            fasting_glucose: Number(data.fasting_glucose) || 95,
            hba1c: Number(data.hba1c) || 5.4,
            smoking: mapSmoking(data.smoker),
            activity: mapActivity(data.physical_activity_level),
            stress: mapStress(data.stress_level),
            salt_intake: mapSaltIntake(data.salt_intake)
        };

        const mlResults = await runMLBridge(mlInput);
        if ('error' in mlResults) return mlResults;

        // 2. Format Data for UI (v9 structure - using native ML interpretation)
        const heartRes = mlResults["Heart Disease"] || {};
        const hyperRes = mlResults["Hypertension"] || {};
        const diabRes = mlResults["Diabetes"] || {};

        // Ensure we have valid data

        // Build predictions array with full ML data
        const buildPrediction = (res: any, disease: string) => ({
            disease,
            probability: `${res.risk_percent || 0}%`,
            riskLevel: res.risk_level === 'HIGH' ? 'High' :
                       res.risk_level === 'MODERATE' ? 'Medium' : 'Low',
            confidence: res.confidence || 0,
            modelAgreement: res.model_agreement || 0,
            individualModels: res.individual_models || {},
            topRiskDrivers: res.top_risk_drivers || [],
            protectiveFactors: res.protective_factors || [],
            summaryParagraph: res.summary_paragraph || '',
            cardText: res.card_text || '',
            reasoning: res.summary_paragraph ? res.summary_paragraph.split('.').slice(0, 2).join('.') + '.' : `${disease} risk assessment based on ensemble ML analysis.`
        });

        const uiOutput = {
            overallAssessment: heartRes.summary_paragraph || 'Health assessment complete. Review individual disease risk scores below.',
            healthScore: mlResults.health_score || 0,
            predictions: [
                buildPrediction(heartRes, 'Heart Disease'),
                buildPrediction(hyperRes, 'Hypertension'),
                buildPrediction(diabRes, 'Diabetes')
            ],
            clinicalFlags: heartRes.clinical_flags || [],
            suggestions: [
                ...(heartRes.recommendations || []),
                ...(hyperRes.recommendations || []),
                ...(diabRes.recommendations || [])
            ].filter((v, i, a) => a.indexOf(v) === i).slice(0, 5) || ['Consult with your healthcare provider for personalized preventive care recommendations.'],
            disclaimer: "HealthBuddy's v9 ensemble provides risk estimation, not diagnosis. Always consult a physician."
        };

        // 3. Persist Full Report for History/PDF
        if (user) {
            const severity = (
                mlResults["Heart Disease"]?.risk_level === 'HIGH' ||
                mlResults["Hypertension"]?.risk_level === 'HIGH' ||
                mlResults["Diabetes"]?.risk_level === 'HIGH'
            ) ? 'critical' : 'normal';

            const healthScore = mlResults.health_score || Math.round(
                100 - ((
                    (parseFloat(heartRes.risk_percent) || 0) +
                    (parseFloat(hyperRes.risk_percent) || 0) +
                    (parseFloat(diabRes.risk_percent) || 0)
                ) / 3)
            );

            const { data: assessment, error: aError } = await supabase
                .from('health_assessments')
                .insert({
                    patient_id: user.id,
                    inputs: mlInput,
                    probabilities: {
                        heart_disease: (heartRes.risk_percent || 0) / 100,
                        hypertension: (hyperRes.risk_percent || 0) / 100,
                        diabetes: (diabRes.risk_percent || 0) / 100
                    },
                    health_score: healthScore,
                    explanation: {
                        summary: heartRes.summary_paragraph || 'Assessment complete',
                        recommendations: heartRes.recommendations || [],
                        flags: heartRes.clinical_flags || []
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
                        summary: heartRes.summary_paragraph || 'AI Clinical assessment complete.',
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
