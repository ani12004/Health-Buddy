'use server'

import { generateWithModelFallback } from './modelFallback'
import { HealthInput } from './types'

export async function analyzeHealthWithGemini(input: HealthInput, language: string = 'English') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return { error: 'Gemini API Key is not configured.' }
    }

    try {
        // Build a detailed prompt for health assessment
        const prompt = `
You are a qualified medical AI assistant. Analyze the following health metrics and provide a comprehensive health risk assessment.

LANGUAGE: Respond ENTIRELY and ONLY in ${language} script (e.g., if Hindi, use Devanagari script). This is critical. All analysis, summaries, and recommendations MUST be in ${language}.

PATIENT DATA:
- Age: ${input.age} years
- Sex: ${input.sex}
- BMI: ${input.bmi} kg/m²
- Waist Circumference: ${input.waist} cm
- Systolic BP: ${input.systolic_bp} mmHg
- Diastolic BP: ${input.diastolic_bp} mmHg
- Resting Heart Rate: ${input.heart_rate} bpm
- Family History: ${input.history}
- Total Cholesterol: ${input.total_cholesterol} mg/dL
- LDL: ${input.ldl} mg/dL
- HDL: ${input.hdl} mg/dL
- Triglycerides: ${input.triglycerides} mg/dL
- Fasting Glucose: ${input.fasting_glucose} mg/dL
- HbA1c: ${input.hba1c}%
- Smoking Status: ${input.smoking}
- Physical Activity: ${input.activity}
- Stress Level: ${input.stress}
- Salt Intake: ${input.salt_intake}

Based on clinical guidelines and these metrics, provide a JSON response with risk assessments for three conditions: Heart Disease, Hypertension, and Diabetes.

Return ONLY valid JSON with this exact structure (no markdown, no additional text). Ensure all string fields are in ${language}.
{
    "Heart Disease": {
        "risk_percent": <0-100>,
        "risk_level": "LOW|MODERATE|HIGH",
        "confidence": <0-100>,
        "top_risk_drivers": [{"feature": "name", "shap": <value>, "label": "Localized Name in ${language}", "reason": "Detailed localized explanation in ${language}"}],
        "protective_factors": [{"feature": "name", "label": "Localized Name in ${language}"}],
        "summary_paragraph": "Clinical summary in ${language}",
        "recommendations": ["rec1 in ${language}", "rec2", "rec3"]
    },
    "Hypertension": {
        "risk_percent": <0-100>,
        "risk_level": "LOW|MODERATE|HIGH",
        "confidence": <0-100>,
        "top_risk_drivers": [{"feature": "name", "shap": <value>, "label": "Localized Name in ${language}", "reason": "Detailed localized explanation in ${language}"}],
        "protective_factors": [{"feature": "name", "label": "Localized Name in ${language}"}],
        "summary_paragraph": "Clinical summary in ${language}",
        "recommendations": ["rec1 in ${language}", "rec2", "rec3"]
    },
    "Diabetes": {
        "risk_percent": <0-100>,
        "risk_level": "LOW|MODERATE|HIGH",
        "confidence": <0-100>,
        "top_risk_drivers": [{"feature": "name", "shap": <value>, "label": "Localized Name in ${language}", "reason": "Detailed localized explanation in ${language}"}],
        "protective_factors": [{"feature": "name", "label": "Localized Name in ${language}"}],
        "summary_paragraph": "Clinical summary in ${language}",
        "recommendations": ["rec1 in ${language}", "rec2", "rec3"]
    },
    "health_score": <0-100>
}
        `

    const { text, modelName } = await generateWithModelFallback(apiKey, prompt)
    console.log('Health assessment model used:', modelName)

        try {
            // Extract JSON from response
            const start = text.indexOf('{')
            const end = text.lastIndexOf('}')
            if (start === -1 || end === -1) {
                throw new Error('No JSON found in response')
            }

            const cleanText = text.substring(start, end + 1)
            const parsed = JSON.parse(cleanText)

            return { data: parsed }
        } catch (parseError) {
            console.error('Gemini Health Assessment Parse Error:', parseError)
            return { error: 'Failed to parse health assessment from Gemini API.' }
        }
    } catch (error: any) {
        console.error('Gemini Health Assessment Error:', error)
        let message = 'Failed to complete health assessment.'
        if (error?.message?.includes('429')) message = 'Rate limit exceeded. Try again shortly.'
        if (error?.message?.includes('503')) message = 'AI service is busy. Please try again later.'
        if (error?.message?.includes('API')) message = 'Gemini API configuration error.'

        return { error: message }
    }
}
