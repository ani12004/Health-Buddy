'use server'

import { GoogleGenerativeAI } from '@google/generative-ai'

const DEFAULT_MODEL_CANDIDATES = [
    'gemini-2.5-pro',
    'gemini-2.5-flash',
    'gemini-2.5-flash-lite',
    'gemini-1.5-pro',
    'gemini-1.5-flash'
]

function getConfiguredModelCandidates() {
    const custom = process.env.GEMINI_MODEL_CANDIDATES
    if (!custom) return DEFAULT_MODEL_CANDIDATES

    const parsed = custom
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)

    return parsed.length > 0 ? parsed : DEFAULT_MODEL_CANDIDATES
}

export async function generateWithModelFallback(apiKey: string, prompt: string) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelCandidates = getConfiguredModelCandidates()
    const failures: string[] = []

    for (const modelName of modelCandidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName })
            const result = await model.generateContent(prompt)
            const response = await result.response
            const text = response.text()
            return { text, modelName }
        } catch (error: any) {
            const message = error?.message || 'Unknown error'
            failures.push(`${modelName}: ${message}`)
            continue
        }
    }

    throw new Error(`All Gemini model candidates failed. ${failures.join(' | ')}`)
}

type ChatHistoryPart = { text: string }
type ChatHistoryItem = { role: string; parts: ChatHistoryPart[] }

export async function generateChatWithModelFallback(
    apiKey: string,
    systemInstruction: string,
    userMessage: string,
    history: ChatHistoryItem[] = []
) {
    const genAI = new GoogleGenerativeAI(apiKey)
    const modelCandidates = getConfiguredModelCandidates()
    const failures: string[] = []
    const normalizedHistory = history
        .filter((h) => Array.isArray(h.parts) && h.parts.length > 0)
        .map((h) => ({
            role: h.role === 'model' ? 'model' : 'user',
            parts: h.parts
                .filter((p) => typeof p?.text === 'string' && p.text.trim().length > 0)
                .map((p) => ({ text: p.text.trim() })),
        }))
        .filter((h) => h.parts.length > 0)

    for (const modelName of modelCandidates) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName })
            const chat = model.startChat({
                systemInstruction,
                history: normalizedHistory as any,
            })

            const result = await chat.sendMessage(userMessage)
            const response = await result.response
            const text = response.text()
            return { text, modelName }
        } catch (error: any) {
            const message = error?.message || 'Unknown error'
            failures.push(`${modelName}: ${message}`)
            continue
        }
    }

    throw new Error(`All Gemini model candidates failed. ${failures.join(' | ')}`)
}
