import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function chatWithAI(
  userMessage: string,
  checkupResults?: any,
  history: {role: string, parts: { text: string }[]}[] = []
) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  // Build system prompt — inject Gemini assessment results if available
  let systemPrompt = `You are HealthBuddy's AI health assistant. 
You help users understand their health and answer general health questions.
Never provide a medical diagnosis. Always recommend consulting a qualified doctor.
Keep responses friendly, clear, and under 200 words unless detail is needed.`

  if (checkupResults) {
    const hd  = checkupResults['Heart Disease']
    const hyp = checkupResults['Hypertension']
    const dia = checkupResults['Diabetes']

    systemPrompt += `

The user has just completed a health checkup. Their Gemini AI-assessed risk results are:

Heart Disease:  ${hd.risk_percent}% risk (${hd.risk_level})
  Top drivers: ${hd.top_risk_drivers?.slice(0,3).map((d:any) => d.feature).join(', ')}

Hypertension:  ${hyp.risk_percent}% risk (${hyp.risk_level})
  Top drivers: ${hyp.top_risk_drivers?.slice(0,3).map((d:any) => d.feature).join(', ')}

Diabetes:      ${dia.risk_percent}% risk (${dia.risk_level})
  Top drivers: ${dia.top_risk_drivers?.slice(0,3).map((d:any) => d.feature).join(', ')}

When answering, reference THEIR specific numbers and risk drivers.
Example: "Your Heart Disease risk is ${hd.risk_percent}%, driven mainly by ${hd.top_risk_drivers?.[0]?.feature}..."
Do not make up new numbers — only use the figures above.`
  }

  try {
    const chat = model.startChat({
      systemInstruction: systemPrompt,
      history: history as any,
    })

    const result = await chat.sendMessage(userMessage)
    return { data: result.response.text() }
  } catch (error: any) {
    console.error('Gemini Chat Error:', error)
    return { error: error.message || 'Failed to generate response' }
  }
}
