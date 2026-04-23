"use server"

import { generateGroqChatWithModelFallback } from './groqModelFallback'

export async function chatWithAI(
  userMessage: string,
  checkupResults?: any,
  history: {role: string, parts: { text: string }[]}[] = []
) {
  const groqApiKey = process.env.GROQ_API_KEY

  if (!groqApiKey) {
    return { error: 'AI chat is not configured. Please set GROQ_API_KEY.' }
  }

  // Build system prompt with latest checkup context if available
  let systemPrompt = `You are HealthBuddy's AI health assistant. 
You help users understand their health and answer general health questions.
Never provide a medical diagnosis. Always recommend consulting a qualified doctor.
Keep responses friendly, clear, and under 200 words unless detail is needed.`

  if (checkupResults) {
    const hd  = checkupResults['Heart Disease'] || {}
    const hyp = checkupResults['Hypertension'] || {}
    const dia = checkupResults['Diabetes'] || {}

    const hdRisk = hd?.risk_percent ?? 'N/A'
    const hdLevel = hd?.risk_level ?? 'N/A'
    const hdDrivers = Array.isArray(hd?.top_risk_drivers)
      ? hd.top_risk_drivers.slice(0, 3).map((d: any) => d?.feature).filter(Boolean).join(', ') || 'N/A'
      : 'N/A'

    const hypRisk = hyp?.risk_percent ?? 'N/A'
    const hypLevel = hyp?.risk_level ?? 'N/A'
    const hypDrivers = Array.isArray(hyp?.top_risk_drivers)
      ? hyp.top_risk_drivers.slice(0, 3).map((d: any) => d?.feature).filter(Boolean).join(', ') || 'N/A'
      : 'N/A'

    const diaRisk = dia?.risk_percent ?? 'N/A'
    const diaLevel = dia?.risk_level ?? 'N/A'
    const diaDrivers = Array.isArray(dia?.top_risk_drivers)
      ? dia.top_risk_drivers.slice(0, 3).map((d: any) => d?.feature).filter(Boolean).join(', ') || 'N/A'
      : 'N/A'

    systemPrompt += `

The user has just completed a health checkup. Their latest risk results are:

Heart Disease:  ${hdRisk}% risk (${hdLevel})
  Top drivers: ${hdDrivers}

Hypertension:  ${hypRisk}% risk (${hypLevel})
  Top drivers: ${hypDrivers}

Diabetes:      ${diaRisk}% risk (${diaLevel})
  Top drivers: ${diaDrivers}

When answering, reference THEIR specific numbers and risk drivers.
Example: "Your Heart Disease risk is ${hdRisk}%, driven mainly by ${hd?.top_risk_drivers?.[0]?.feature || 'key metabolic factors'}..."
Do not make up new numbers — only use the figures above.`
  }

  try {
    const { text, modelName } = await generateGroqChatWithModelFallback(
      groqApiKey,
      systemPrompt,
      userMessage,
      history
    )

    console.log('Groq chat model used:', modelName)

    if (!text || !text.trim()) {
      return { error: 'AI returned an empty response. Please try again.' }
    }

    return { data: text }
  } catch (error: any) {
    console.error('Groq Chat Error:', error?.message || error)
    return { error: 'All Groq models failed to respond. Please try again.' }
  }
}
