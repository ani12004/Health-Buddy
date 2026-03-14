'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

export async function analyzeHealthData(data: any) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return { error: 'Gemini API Key is not configured on the server.' }
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' })

        const prompt = `
        Act as a medical AI assistant. Analyze the following patient health parameters:
        
        Age: ${data.age}
        Sex: ${data.sex}
        BMI: ${data.bmi}
        Waist Circumference: ${data.waist_circumference} cm
        Systolic BP: ${data.systolic_bp} mmHg
        Diastolic BP: ${data.diastolic_bp} mmHg
        Resting Heart Rate: ${data.resting_heart_rate} bpm
        Total Cholesterol: ${data.total_cholesterol} mg/dL
        LDL: ${data.ldl} mg/dL
        HDL: ${data.hdl} mg/dL
        Triglycerides: ${data.triglycerides} mg/dL
        Fasting Glucose: ${data.fasting_glucose} mg/dL
        HbA1c: ${data.hba1c}%
        Smoker: ${data.smoker}
        Family History of Heart Disease: ${data.family_history_heart}
        Physical Activity Level: ${data.physical_activity_level}
        Alcohol Use: ${data.alcohol_use}
        Salt Intake: ${data.salt_intake}
        Stress Level: ${data.stress_level}

        Existing Conditions:
        - Heart Disease: ${data.heart_disease ? 'Yes' : 'No'}
        - Hypertension: ${data.hypertension ? 'Yes' : 'No'}

        Task:
        Predict the possibility of potential health issues or diseases based on these parameters.
        Provide a response that is easy to understand (medium level).
        
        Return the response in strictly valid JSON format with the following structure:
        {
            "predictions": [
                { "disease": "Name of disease", "probability": "Percentage (e.g. 45%)", "riskLevel": "Low/Medium/High", "reasoning": "Brief explanation" }
            ],
            "overallAssessment": "A brief summary paragraph of the patient's health status.",
            "suggestions": ["List of actionable suggestions for improvement"],
            "disclaimer": "Standard medical disclaimer."
        }
        
        Return ONLY a raw JSON string. Do not include markdown code blocks.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        try {
            const start = text.indexOf('{')
            const end = text.lastIndexOf('}')

            if (start === -1 || end === -1) {
                console.error('No JSON found in response:', text)
                return { error: 'The AI provided an invalid response format.' }
            }

            const cleanText = text.substring(start, end + 1)
            return { data: JSON.parse(cleanText) }

        } catch (parseError) {
            console.error('Gemini Checkup Parse Error:', parseError)
            return { error: 'Failed to process the AI analysis results.' }
        }

    } catch (error: any) {
        console.error('Gemini Checkup Analysis Error:', error)
        let message = 'Failed to analyze health data.'
        if (error?.message?.includes('429')) message = 'Rate limit exceeded. Please wait a moment.'
        if (error?.message?.includes('404')) message = 'AI model not found. This may be due to API key restrictions.'
        if (error?.message?.includes('400')) message = 'Invalid request to AI service.'

        return { error: message }
    }
}
