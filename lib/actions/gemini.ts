'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

export async function analyzeSymptoms(symptoms: string) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Gemini API Key is missing in environment variables")
        throw new Error('Gemini API configuration error')
    }

    try {
        const prompt = `
      You are an advanced medical AI assistant named "Health Buddy". 
      The user is describing their symptoms: "${symptoms}".
      
      IMPORTANT: Detect the language and style of the user's input. Support ALL major Indian languages (e.g., English, Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Hinglish, etc.). 
      Provide the response in the SAME language/style as the user.
      
      Please provide a balanced clinical analysis. Your response must be in valid JSON format with the following fields:
      - title: A professional medical term or descriptive title (e.g., "Potential Dehydration") in the USER'S LANGUAGE.
      - severity: "Low", "Moderate", or "High" (Keep this value in English for logic, but you can add the translation in parentheses if needed).
      - summary: A clear explanation of possible causes (2-3 sentences) in the USER'S LANGUAGE.
      - advice: Practical actionable advice, including 1-2 self-care steps and when to see a doctor, in the USER'S LANGUAGE.
      
      Do not output markdown code blocks, just the raw JSON string.
    `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        // Clean up potential markdown code blocks
        const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim()

        return JSON.parse(jsonString)
    } catch (error: any) {
        console.error('Gemini Analysis Error:', error)
        throw new Error(`AI Analysis failed: ${error.message || 'Unknown error'}`)
    }
}

export async function chatWithAI(message: string) {
    if (!process.env.GEMINI_API_KEY) {
        console.error("Gemini API Key is missing in environment variables")
        throw new Error('Gemini API configuration error')
    }

    try {
        const prompt = `
            You are "Health Buddy", an empathetic and knowledgeable medical AI assistant.
            You are talking to a patient.
            
            User message: "${message}"
            
            IMPORTANT: Detect the language and style of the user's message (e.g., English, Kannada, Hindi, Tamil, Telugu, Malayalam, Marathi, Bengali, Gujarati, Punjabi, Hinglish, etc.).
            Reply in the EXACT SAME language and conversational style.
            
            Provide a helpful, safe, and concise response. 
            If the user asks for medical diagnosis, provide information but always add a disclaimer to see a real doctor.
            Keep the tone professional yet warm.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        return text

    } catch (error: any) {
        console.error('Gemini Chat Error:', error)
        throw new Error(`AI Chat failed: ${error.message || 'Unknown error'}`)
    }
}
