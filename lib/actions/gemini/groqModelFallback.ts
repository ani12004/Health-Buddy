"use server"

type ChatHistoryPart = { text: string }
type ChatHistoryItem = { role: string; parts: ChatHistoryPart[] }

const DEFAULT_GROQ_MODEL_CANDIDATES = [
    // Latest major models
    'llama-4-scout-17b-16e-instruct',
    'llama-4-maverick-17b-128e-instruct',

    // Reasoning-focused options
    'qwen-qwq-32b',
    'deepseek-r1-distill-llama-70b',

    // High quality general-purpose models
    'llama-3.3-70b-versatile',
    'llama-3.3-70b-specdec',
    'llama-3.1-8b-instant',
    'gemma2-9b-it',
    'mixtral-8x7b-32768',

    // Compatibility names often used in Groq/OpenAI-style payloads
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'meta-llama/llama-4-maverick-17b-128e-instruct',
    'meta-llama/llama-3.3-70b-versatile',
    'meta-llama/llama-3.1-8b-instant',
    'mistralai/mixtral-8x7b-32768',

    // Legacy fallbacks
    'llama3-70b-8192',
    'llama3-8b-8192',
]

function getConfiguredGroqModelCandidates() {
    const custom = process.env.GROQ_MODEL_CANDIDATES
    if (!custom) return DEFAULT_GROQ_MODEL_CANDIDATES

    const parsed = custom
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean)
    const unique = [...new Set(parsed)]

    return unique.length > 0 ? unique : DEFAULT_GROQ_MODEL_CANDIDATES
}

export async function generateGroqChatWithModelFallback(
    apiKey: string,
    systemInstruction: string,
    userMessage: string,
    history: ChatHistoryItem[] = []
) {
    const modelCandidates = getConfiguredGroqModelCandidates()
    const failures: string[] = []

    const normalizedHistory = history
        .filter((h) => Array.isArray(h.parts) && h.parts.length > 0)
        .map((h) => ({
            role: h.role === 'model' ? 'assistant' : 'user',
            content: h.parts
                .filter((p) => typeof p?.text === 'string' && p.text.trim().length > 0)
                .map((p) => p.text.trim())
                .join('\n')
        }))
        .filter((h) => h.content.length > 0)

    for (const modelName of modelCandidates) {
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: modelName,
                    temperature: 0.4,
                    max_tokens: 600,
                    messages: [
                        { role: 'system', content: systemInstruction },
                        ...normalizedHistory,
                        { role: 'user', content: userMessage }
                    ]
                }),
                signal: AbortSignal.timeout(20_000),
            })

            if (!response.ok) {
                const detail = await response.text().catch(() => '')
                failures.push(`${modelName}: HTTP ${response.status}${detail ? ` ${detail.slice(0, 140)}` : ''}`)
                continue
            }

            const json = await response.json()
            const text = json?.choices?.[0]?.message?.content

            if (typeof text === 'string' && text.trim().length > 0) {
                return { text: text.trim(), modelName }
            }

            failures.push(`${modelName}: Empty response content`)
        } catch (error: any) {
            failures.push(`${modelName}: ${error?.message || 'Unknown error'}`)
        }
    }

    throw new Error(`All Groq model candidates failed. ${failures.join(' | ')}`)
}
