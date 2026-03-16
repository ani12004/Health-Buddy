import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

export async function getHealthUpdate(userFeeling: string) {
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const systemPrompt = `You are a caring health companion called HealthBuddy.
The user will describe how they are feeling today.

Your response must:
1. Acknowledge what they're feeling with empathy (1 sentence)
2. Give 1-2 possible everyday explanations (stress, hydration, sleep, diet)
3. Suggest 2-3 simple self-care actions they can take today
4. End with: "If symptoms persist or worsen, please see a doctor."

Rules:
- Never diagnose medical conditions
- Never prescribe medication
- Keep total response under 150 words
- Be warm and supportive, not clinical`

  const result = await model.generateContent({
    contents: [
        { role: 'user', parts: [{ text: `I am feeling: ${userFeeling}` }] }
    ],
    generationConfig: {
        maxOutputTokens: 250,
    }
  });

  // Note: systemInstruction is set separately if needed, but for simplicity here we include it or use newer API if supported by the package
  // Re-calling with system instruction if the SDK supports it in the way specified in brief
  const resultWithSystem = await model.generateContent({
    systemInstruction: systemPrompt,
    contents: [{ role: 'user', parts: [{ text: userFeeling }] }],
  })

  return resultWithSystem.response.text()
}
