'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function chatWithAI(message: string) {
    if (!process.env.GEMINI_API_KEY) {
        return { error: 'Gemini API Key is not configured.' }
    }

    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3-flash' })

        const prompt = `
        Act as a friendly and knowledgeable medical AI assistant named "Health Buddy".
        User message: "${message}"

        Detect the language of the user's message and respond in that same language.
        Provide a helpful, empathetic, and medically sound response. 
        Keep it concise (under 100 words) unless a detailed explanation is necessary.
        Always advise consulting a doctor for serious concerns.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        return { data: response.text() }

    } catch (error: any) {
        console.error('Gemini Chat Error:', error)
        let message = 'Failed to get response from AI.'
        if (error?.message?.includes('429')) message = 'Rate limit exceeded.'
        if (error?.message?.includes('404')) message = 'AI model not found. Check API key permissions.'
        
        return { error: message }
    }
}
