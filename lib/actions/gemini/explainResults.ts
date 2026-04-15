'use server'

import { MLInput, MLResult } from '@/lib/actions/ml/bridge'
import { generateWithModelFallback } from './modelFallback'

export async function explainMLWithGemini(input: MLInput, mlResults: MLResult, language: string = 'English') {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return { error: 'Gemini API Key is not configured.' }
    }

    try {
        const prompt = `
You are a WORLD-CLASS medical AI assistant and clinical diagnostician specialized in the Indian medical context. 
Your goal is to explain a patient's health risks based on Machine Learning predictions and provide actionable, localized medical advice.

LANGUAGE: Respond ENTIRELY and ONLY in ${language} script (e.g., if Hindi, use Devanagari script). 
        
DIAGNOSTIC DATA:
- Patient Profile: ${JSON.stringify(input, null, 2)}
- ML Risk Analysis: 
  * Heart Disease: ${mlResults['Heart Disease'].risk_level} (${mlResults['Heart Disease'].risk_percent}%)
  * Hypertension: ${mlResults['Hypertension'].risk_level} (${mlResults['Hypertension'].risk_percent}%)
  * Diabetes: ${mlResults['Diabetes'].risk_level} (${mlResults['Diabetes'].risk_percent}%)

TASK:
For each disease, generate the following in ${language}:
1. "summary_paragraph": A professional, clinical detailed summary paragraph (3-4 sentences).
2. "top_risk_drivers": List 3-5 factors from the data driving this risk. Include a "label" (user-friendly name) and "reason" (detailed clinical explanation).
3. "protective_factors": Up to 2 factors lowering the risk.
4. "precautions": A list of 4-6 SPECIFIC, ACTIONABLE precautions (diet, exercise, lifestyle, clinical tests) tailored to the patient.

CRITICAL REQUIREMENTS:
- If High/Critical Risk: Provide urgent, strong warnings in ${language}.
- Localization: Use culturally relevant advice (e.g., specific Indian dietary examples if relevant).
- JSON: Return ONLY valid, raw JSON. Do not include markdown code blocks.

Schema:
{
  "Heart Disease": { "summary_paragraph": "", "top_risk_drivers": [{ "label": "", "reason": "" }], "protective_factors": [], "precautions": [] },
  "Hypertension": { ... },
  "Diabetes": { ... }
}
`

    const { text, modelName } = await generateWithModelFallback(apiKey, prompt)
    console.log('Explanation model used:', modelName)

        try {
            const start = text.indexOf('{')
            const end = text.lastIndexOf('}')
            const cleanText = text.substring(start, end + 1)
            const parsed = JSON.parse(cleanText)
            return { data: parsed }
        } catch (e) {
            console.error('Explanation Parse Error:', e)
            return { error: 'Failed to parse explanation' }
        }
    } catch (error: any) {
        console.error('Explanation Error:', error)
        return { error: 'Explanation service unavailable' }
    }
}
