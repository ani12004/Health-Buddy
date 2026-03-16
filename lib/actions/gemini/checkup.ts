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

        // Build comprehensive overall assessment explaining everything
        const buildOverallAssessment = () => {
            const healthScore = mlResults.health_score || 0;
            const parts: string[] = [];

            // 1. Health Score Context
            if (healthScore >= 70) {
                parts.push(`Your overall health score of ${healthScore}/100 indicates good health status with manageable risk factors.`);
            } else if (healthScore >= 50) {
                parts.push(`Your overall health score of ${healthScore}/100 indicates moderate health concerns that warrant attention and lifestyle modifications.`);
            } else {
                parts.push(`Your overall health score of ${healthScore}/100 indicates significant health risks requiring immediate attention and medical consultation.`);
            }

            // 2. Disease-specific risk breakdown
            const diseaseRisks: string[] = [];
            const formatRisk = (name: string, res: any) => {
                if (!res.risk_percent) return null;
                const level = res.risk_level === 'HIGH' ? 'high' : res.risk_level === 'MODERATE' ? 'moderate' : 'low';
                return `${name} at ${res.risk_percent}% (${level} risk)`;
            };

            const heartRisk = formatRisk('Heart Disease', heartRes);
            const hyperRisk = formatRisk('Hypertension', hyperRes);
            const diabRisk = formatRisk('Diabetes', diabRes);

            if (heartRisk) diseaseRisks.push(heartRisk);
            if (hyperRisk) diseaseRisks.push(hyperRisk);
            if (diabRisk) diseaseRisks.push(diabRisk);

            if (diseaseRisks.length > 0) {
                parts.push(`Our ensemble ML analysis evaluated your risk across three conditions: ${diseaseRisks.join(', ')}.`);
            }

            // 3. Key Risk Drivers (top factors increasing risk)
            const allRiskDrivers = [
                ...(heartRes.top_risk_drivers || []).map((d: any) => ({ ...d, disease: 'heart' })),
                ...(hyperRes.top_risk_drivers || []).map((d: any) => ({ ...d, disease: 'blood pressure' })),
                ...(diabRes.top_risk_drivers || []).map((d: any) => ({ ...d, disease: 'diabetes' }))
            ].sort((a, b) => (b.shap || 0) - (a.shap || 0)).slice(0, 3);

            if (allRiskDrivers.length > 0) {
                const driverNames = allRiskDrivers.map((d: any) => {
                    const name = d.feature?.replace(/_/g, ' ') || 'unknown factor';
                    return name.charAt(0).toUpperCase() + name.slice(1);
                });
                parts.push(`The primary factors contributing to your risk profile include ${driverNames.join(', ')}.`);
            }

            // 4. Protective Factors
            const allProtective = [
                ...(heartRes.protective_factors || []),
                ...(hyperRes.protective_factors || []),
                ...(diabRes.protective_factors || [])
            ].slice(0, 2);

            if (allProtective.length > 0) {
                const protectiveNames = allProtective.map((p: any) => {
                    const name = p.feature?.replace(/_/g, ' ') || 'healthy habit';
                    return name.charAt(0).toUpperCase() + name.slice(1);
                });
                parts.push(`On the positive side, ${protectiveNames.join(' and ')} ${allProtective.length === 1 ? 'is' : 'are'} working in your favor.`);
            }

            // 5. Action-oriented closing
            const highRiskCount = [heartRes, hyperRes, diabRes].filter(r => r.risk_level === 'HIGH').length;
            if (highRiskCount > 0) {
                parts.push(`Given ${highRiskCount > 1 ? 'multiple elevated risk areas' : 'an elevated risk area'}, we recommend consulting with your healthcare provider to discuss preventive strategies and potential screenings.`);
            } else {
                parts.push(`Continue maintaining healthy habits and review the detailed breakdown below for personalized insights.`);
            }

            return parts.join(' ');
        };

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
            overallAssessment: buildOverallAssessment(),
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
