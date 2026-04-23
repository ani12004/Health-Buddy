"use server"

import { generateChatWithModelFallback } from './modelFallback'

function buildFallbackChatReply(userMessage: string, checkupResults?: any) {
  const base = [
    "I can still help with general wellness guidance right now.",
    "I am currently running in fallback mode, so responses are informational and not a diagnosis.",
  ]

  if (!checkupResults) {
    return `${base.join(' ')} For your message (\"${userMessage}\"), focus on hydration, balanced meals, light movement, stress control, and proper sleep tonight. If symptoms persist or worsen, please see a doctor.`
  }

  const hd = checkupResults['Heart Disease']
  const hyp = checkupResults['Hypertension']
  const dia = checkupResults['Diabetes']

  const snippets = [
    hd ? `Heart risk: ${hd.risk_percent}% (${hd.risk_level})` : null,
    hyp ? `BP risk: ${hyp.risk_percent}% (${hyp.risk_level})` : null,
    dia ? `Diabetes risk: ${dia.risk_percent}% (${dia.risk_level})` : null,
  ].filter(Boolean)

  return `${base.join(' ')} Based on your latest checkup, ${snippets.join(', ')}. For your question (\"${userMessage}\"), prioritize low-salt whole foods, regular walking, consistent sleep, and follow-up labs as advised by your clinician. If you notice chest pain, severe breathlessness, fainting, very high BP, or persistently high glucose symptoms, seek urgent care.`
}

export async function chatWithAI(
  userMessage: string,
  checkupResults?: any,
  history: {role: string, parts: { text: string }[]}[] = []
) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return { data: buildFallbackChatReply(userMessage, checkupResults) }
  }

  // Build system prompt — inject Gemini assessment results if available
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

The user has just completed a health checkup. Their Gemini AI-assessed risk results are:

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
    const { text, modelName } = await generateChatWithModelFallback(
      apiKey,
      systemPrompt,
      userMessage,
      history
    )
    console.log('Chat model used:', modelName)
    if (!text || !text.trim()) {
      return { data: buildFallbackChatReply(userMessage, checkupResults) }
    }
    return { data: text }
  } catch (error: any) {
    console.error('Gemini Chat Error:', error)
    return { data: buildFallbackChatReply(userMessage, checkupResults) }
  }
}
