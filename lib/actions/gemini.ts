'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function analyzeHealthData(data: any) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

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
        
        Do not include markdown code blocks (like \`\`\`json). Just return the raw JSON string.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up markdown if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(cleanText)

    } catch (error) {
        console.error('Gemini Analysis Error:', error)
        throw new Error('Failed to analyze health data.')
    }
}

export async function analyzeSymptoms(symptoms: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `
        Act as a medical AI assistant. Analyze the following symptoms provided by a patient:
        "${symptoms}"

        Task:
        1. Identify the potential condition(s).
        2. Assess the severity (Low, Moderate, High).
        3. Provide a brief summary.
        4. Give a clear recommendation/advice.

        Return the response in strictly valid JSON format with the following structure:
        {
            "title": "Potential Condition Name",
            "severity": "Low/Moderate/High",
            "summary": "Brief explanation of what might be happening.",
            "advice": "Actionable advice (e.g., rest, see a doctor, go to ER)."
        }

        Do not include markdown code blocks. Just return the raw JSON string.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(cleanText)

    } catch (error) {
        console.error('Gemini Symptom Analysis Error:', error)
        throw new Error('Failed to analyze symptoms.')
    }
}

export async function chatWithAI(message: string) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' })

        const prompt = `
        Act as a friendly and knowledgeable medical AI assistant named "Health Buddy".
        User message: "${message}"

        Provide a helpful, empathetic, and medically sound response. 
        Keep it concise (under 100 words) unless a detailed explanation is necessary.
        Always advise consulting a doctor for serious concerns.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        return response.text()

    } catch (error) {
        console.error('Gemini Chat Error:', error)
        throw new Error('Failed to get response from AI.')
    }
}
