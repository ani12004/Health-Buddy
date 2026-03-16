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
            age: Number(data.age),
            sex: data.sex,
            bmi: Number(data.bmi),
            waist: Number(data.waist_circumference),
            systolic_bp: Number(data.systolic_bp),
            diastolic_bp: Number(data.diastolic_bp),
            heart_rate: Number(data.resting_heart_rate),
            history: data.family_history_heart ? 'Yes' : 'None',
            total_cholesterol: Number(data.total_cholesterol),
            ldl: Number(data.ldl),
            hdl: Number(data.hdl),
            triglycerides: Number(data.triglycerides),
            fasting_glucose: Number(data.fasting_glucose),
            hba1c: Number(data.hba1c),
            smoking: data.smoker,
            activity: data.physical_activity_level,
            stress: data.stress_level,
            salt_intake: data.salt_intake
        };

        const mlResults = await runMLBridge(mlInput);
        if ('error' in mlResults) return mlResults;

        // 2. Map Professional Report Data
        const reportDetails = {
            patient_name: user?.user_metadata?.full_name || 'Patient',
            patient_email: user?.email || '',
            report_id: Math.random().toString(36).substring(7),
            report_date: new Date().toISOString(),
            probabilities: {
                'Heart Disease': mlResults["Heart Disease"].risk_percent,
                'Hypertension': mlResults["Hypertension"].risk_percent,
                'Diabetes': mlResults["Diabetes"].risk_percent
            },
            confidence: {
                'Heart Disease': mlResults["Heart Disease"].confidence,
                'Hypertension': mlResults["Hypertension"].confidence,
                'Diabetes': mlResults["Diabetes"].confidence
            },
            inputs: Object.entries(mlInput).map(([k, v]) => {
                const flag = mlResults["Heart Disease"].clinical_flags.find((f: any) => f.label.toLowerCase().includes(k.replace('_', ' ').toLowerCase()));
                return [k.replace('_', ' ').toUpperCase(), v, flag ? flag.status : 'normal'];
            }),
            factors: mlResults["Heart Disease"].top_risk_drivers.map((d: any) => `${d.feature}: ${d.shap > 0 ? 'Increases risk' : 'Protective'}`),
            shap: mlResults["Heart Disease"].top_risk_drivers,
            recommendations: mlResults["Heart Disease"].recommendations.map((r: string, i: number) => ({
                priority: i < 1 ? 'URGENT' : i < 3 ? 'HIGH' : 'MEDIUM',
                title: r.split(':')[0],
                body: r.split(':')[1] || r
            })),
            summary: mlResults["Heart Disease"].summary_paragraph,
            emergency: "Seek immediate care for chest pain, shortness of breath, or sudden weakness."
        };

        // 3. Persist to Supabase
        if (user) {
            const severity = mlResults["Heart Disease"].risk_percent > 65 ? 'critical' : 'normal';

            const { data: assessment } = await supabase
                .from('health_assessments')
                .insert({
                    patient_id: user.id,
                    inputs: mlInput,
                    probabilities: {
                        heart_disease: mlResults["Heart Disease"].risk_percent / 100,
                        hypertension: mlResults["Hypertension"].risk_percent / 100,
                        diabetes: mlResults["Diabetes"].risk_percent / 100
                    },
                    health_score: mlResults.health_score,
                    explanation: {
                        summary: mlResults["Heart Disease"].summary_paragraph,
                        recommendations: mlResults["Heart Disease"].recommendations,
                        flags: mlResults["Heart Disease"].clinical_flags
                    },
                    severity: severity
                })
                .select()
                .single();

            await supabase
                .from('reports')
                .insert({
                    patient_id: user.id,
                    assessment_id: assessment?.id,
                    title: 'V7 AI Medical Assessment',
                    type: 'ai-checkup',
                    summary: mlResults["Heart Disease"].summary_paragraph,
                    content: reportDetails, 
                    severity: severity,
                    status: 'generated'
                });
        }

        return { data: reportDetails }

    } catch (error: any) {
        console.error('Checkup Error:', error)
        return { error: 'Failed to analyze health data.' }
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
        patient: patient?.full_name || 'Patient',
        email: patient?.email || '',
        report_id: report.id.substring(0, 8),
        date: new Date(report.created_at).toLocaleDateString('en-GB', { 
            day: 'numeric', month: 'long', year: 'numeric' 
        }),
        severity: report.severity || 'normal',
        health_score: report.health_score || assessment?.health_score || 0,
        probs: {
            'Heart Disease': scaleProb(assessment?.probabilities?.heart_disease || content.probabilities?.['Heart Disease']),
            'Hypertension': scaleProb(assessment?.probabilities?.hypertension || content.probabilities?.['Hypertension']),
            'Diabetes': scaleProb(assessment?.probabilities?.diabetes || content.probabilities?.['Diabetes'])
        },
        conf: {
            'Score Confidence': scaleProb(assessment?.confidence_scores?.heart_disease || content.confidence?.['Heart Disease'] || 0.95)
        },
        inputs: assessment?.inputs ? Object.entries(assessment.inputs).map(([k, v]) => [
            k.replace('_', ' ').toUpperCase(), v, 'normal'
        ]) : content.inputs || [],
        factors: assessment?.explanation?.summary ? [assessment.explanation.summary] : content.factors || [],
        recs: (assessment?.explanation?.recommendations || content.recommendations || []).map((r: any) => {
           if (typeof r === 'string') return ['HIGH', r];
           return [r.priority || 'HIGH', (r.title || '') + (r.body ? ": " + r.body : "")];
        }),
        summary: report.summary || assessment?.explanation?.summary || "Clinical assessment complete.",
        emergency: content.emergency || "Seek immediate medical attention for acute symptoms.",
        shap: assessment?.shap_values ? Object.entries(assessment.shap_values).flatMap(([disease, drivers]: [string, any]) => 
            drivers.map((d: any) => [d.feature, disease.replace('_', ' ').toUpperCase(), d.shap, d.shap > 0])
        ) : []
    };
}
