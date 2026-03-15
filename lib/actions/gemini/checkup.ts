'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@/lib/supabase/server'
import { runMLBridge } from '../ml/bridge'

export async function analyzeHealthData(data: any) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return { error: 'Gemini API Key is not configured on the server.' }
    }

    try {
        // 1. Run ML Bridge for accurate risk scores
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
        const hasML = mlResults && !mlResults.error;

        // 2. Run Gemini Interpreter with ML context
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `
        Act as a medical AI assistant. Analyze the following patient health parameters and ML risk predictions:
        
        ### Patient Data:
        - Age: ${data.age}, Sex: ${data.sex}, BMI: ${data.bmi}
        - BP: ${data.systolic_bp}/${data.diastolic_bp}, Glucose: ${data.fasting_glucose}
        - HbA1c: ${data.hba1c}%, Smoker: ${data.smoker}
        - Stress: ${data.stress_level}, Activity: ${data.physical_activity_level}
        
        ${hasML ? `
        ### ML Engine Predictions:
        - Heart Disease Probability: ${(mlResults.probabilities.heart_disease * 100).toFixed(1)}%
        - Hypertension Probability: ${(mlResults.probabilities.hypertension * 100).toFixed(1)}%
        - Overall Health Score: ${mlResults.health_score}/100
        ` : ''}

        ### Task:
        Predict potential health issues and provide a summary.
        
        Return the response in strictly valid JSON format:
        {
            "predictions": [
                { "disease": "Name", "probability": "Percentage", "riskLevel": "Low/Medium/High", "reasoning": "Brief explanation" }
            ],
            "overallAssessment": "Summary paragraph...",
            "suggestions": ["Step 1", "Step 2..."],
            "disclaimer": "Standard disclaimer."
        }
        
        Return ONLY valid JSON.
        `;

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const analysisResult = JSON.parse(text.replace(/```json|```/g, ''));

        // 3. Prepare Professional Report Data
        const getFlag = (val: any, param: string) => {
            // Simple threshold logic for flagging - can be refined
            if (param === 'Systolic BP' && val > 140) return 'critical';
            if (param === 'Diastolic BP' && val > 90) return 'critical';
            if (param === 'BMI' && val > 30) return 'critical';
            if (param === 'Fasting Glucose' && val > 126) return 'critical';
            if (val === 'High' || val === 'Regular' || val === 'Yes') return 'warning';
            return null;
        };

        const reportDetails = {
            patient_name: '', // Will be filled from profile
            patient_email: '', // Will be filled from profile
            report_id: '', // Will be filled from persistence
            report_date: new Date().toISOString(),
            probabilities: hasML ? {
                'Hypertension': mlResults.probabilities.hypertension * 100,
                'Heart Disease': mlResults.probabilities.heart_disease * 100
            } : {},
            confidence: hasML ? {
                'Hypertension': mlResults.confidence.hypertension * 100,
                'Heart Disease': mlResults.confidence.heart_disease * 100
            } : {},
            inputs: {
                "Systolic BP": { value: `${data.systolic_bp} mmHg`, flag: getFlag(data.systolic_bp, 'Systolic BP') },
                "Diastolic BP": { value: `${data.diastolic_bp} mmHg`, flag: getFlag(data.diastolic_bp, 'Diastolic BP') },
                "BMI": { value: `${data.bmi} kg/m²`, flag: getFlag(data.bmi, 'BMI') },
                "Fasting Glucose": { value: `${data.fasting_glucose} mg/dL`, flag: getFlag(data.fasting_glucose, 'Fasting Glucose') },
                "Smoking": { value: data.smoker, flag: getFlag(data.smoker, 'Smoking') },
                "Activity": { value: data.physical_activity_level, flag: getFlag(data.physical_activity_level, 'Activity') },
                "Stress": { value: data.stress_level, flag: getFlag(data.stress_level, 'Stress') },
                "Age / Sex": { value: `${data.age} / ${data.sex}`, flag: null },
            },
            factors: analysisResult.predictions.map((p: any) => ({
                title: `${p.disease} (${p.probability})`,
                body: p.reasoning
            })),
            shap: hasML ? mlResults.shap : null,
            recommendations: analysisResult.suggestions.map((s: string, i: number) => ({
                priority: i < 2 ? 'URGENT' : i < 4 ? 'HIGH' : 'MEDIUM',
                title: s.split(':')[0] || 'Recommendation',
                body: s.split(':')[1] || s
            })),
            summary: analysisResult.overallAssessment,
            emergency: analysisResult.disclaimer || "Seek immediate care for chest pain, shortness of breath, or sudden weakness."
        };

        // Persist to Supabase
        if (user) {
            const hasHighRisk = analysisResult.predictions.some((p: any) => p.riskLevel === 'High');
            const severity = hasHighRisk ? 'critical' : 'normal';

            // Insert health assessment first
            const { data: assessment, error: assessmentError } = await supabase
                .from('health_assessments')
                .insert({
                    patient_id: user.id,
                    inputs: mlInput,
                    probabilities: hasML ? mlResults.probabilities : null,
                    health_score: hasML ? mlResults.health_score : null,
                    explanation: {
                        summary: analysisResult.overallAssessment,
                        recommendations: analysisResult.suggestions,
                        predictions: analysisResult.predictions,
                        shap: hasML ? mlResults.shap : null,
                        confidence: hasML ? mlResults.confidence : null
                    },
                    severity: severity
                })
                .select()
                .single();

            if (assessmentError) {
                console.error('Failed to persist assessment:', assessmentError);
            }

            // Update or Insert report
            await supabase
                .from('reports')
                .insert({
                    patient_id: user.id,
                    assessment_id: assessment?.id,
                    title: 'Hybrid AI/ML Assessment',
                    type: 'ai-checkup',
                    summary: analysisResult.overallAssessment,
                    top_risks: analysisResult.predictions,
                    recommendations: analysisResult.suggestions,
                    content: reportDetails, 
                    severity: severity,
                    status: 'generated'
                });
        }

        return { data: analysisResult }

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

    if (error) {
        console.error('getReportPDFData Supabase Error:', error);
        return null;
    }
    if (!report) {
        console.error('getReportPDFData: No report found for ID:', reportId);
        return null;
    }

    const patient = report.patient;
    const assessment = report.assessment;
    const content = report.content || {};

    // Helper to scale probabilities if stored as decimals
    const scaleProb = (v: any) => {
        const val = parseFloat(v);
        if (isNaN(val)) return 0;
        return val <= 1 ? val * 100 : val;
    };

    const probs: any = {};
    const rawProbs = report.probabilities || assessment?.probabilities || content.probabilities || {};
    Object.entries(rawProbs).forEach(([k, v]) => {
        probs[k] = scaleProb(v);
    });

    const confidence: any = {};
    const rawConf = assessment?.explanation?.confidence || content.confidence || {};
    Object.entries(rawConf).forEach(([k, v]) => {
        confidence[k] = scaleProb(v);
    });

    // Extract inputs correctly
    const rawInputs = assessment?.inputs || content.inputs || {};
    const inputs = Object.entries(rawInputs).map(([k, v]: [string, any]) => [
        k, 
        typeof v === 'object' ? v.value : v, 
        typeof v === 'object' ? v.flag : null
    ]);

    // Extract factors - handle both object and string formats
    const rawFactors = content.factors || assessment?.explanation?.predictions || [];
    const factors = rawFactors.map((f: any) => {
        if (typeof f === 'string') return f;
        const title = f.title || f.disease || 'Risk';
        const body = f.body || f.reasoning || '';
        return title + (body ? ": " + body : "");
    });

    // Extract recommendations
    const rawRecs = content.recommendations || assessment?.explanation?.recommendations || assessment?.explanation?.suggestions || [];
    const recs = rawRecs.map((r: any) => {
        if (typeof r === 'string') {
            const parts = r.split(':');
            return [parts[0].includes('URGENT') ? 'URGENT' : 'HIGH', r];
        }
        return [r.priority || 'HIGH', (r.title || '') + (r.body ? ": " + r.body : "")];
    });

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
        probs,
        conf: confidence,
        inputs,
        factors,
        recs,
        summary: report.summary || content.summary || "No summary available.",
        emergency: content.emergency || "Emergency: seek immediate care for acute symptoms.",
        shap: content.shap ? Object.entries(content.shap).flatMap(([disease, features]: [string, any]) => 
            Object.entries(features).map(([feat, val]: [string, any]) => [
                feat, disease, val, val > 0
            ])
        ) : []
    };
}
