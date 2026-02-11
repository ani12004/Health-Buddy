'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
