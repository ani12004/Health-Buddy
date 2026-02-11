'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

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
