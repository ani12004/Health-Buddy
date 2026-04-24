"use server"

import { generateGroqChatWithModelFallback } from './groqModelFallback'

export async function generateGroqDetailedAnalysis(analysisResults: any, healthScore: number) {
    const apiKey = process.env.GROQ_API_KEY
    if (!apiKey) return null

    const prompt = `
    Analyze these health results:
    - Score: ${healthScore}/100
    - Heart: ${analysisResults['Heart Disease']?.risk_percent}% (${analysisResults['Heart Disease']?.risk_level})
    - BP: ${analysisResults['Hypertension']?.risk_percent}% (${analysisResults['Hypertension']?.risk_level})
    - Diabetes: ${analysisResults['Diabetes']?.risk_percent}% (${analysisResults['Diabetes']?.risk_level})
    
    Provide a deep clinical interpretation (max 120 words). 
    Focus on how these risks interact and what is the single most critical priority.
    Avoid disclaimers (they are added elsewhere).
    `

    try {
        const { text } = await generateGroqChatWithModelFallback(apiKey, "You are a senior clinical analyst. Provide concise, high-impact medical insights.", prompt)
        return text
    } catch (error) {
        console.error("Groq Analysis Error:", error)
        return null
    }
}
