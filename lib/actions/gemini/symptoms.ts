
export async function analyzeSymptoms(symptoms: string) {
    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
        return { error: 'Gemini API Key is not configured.' }
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey)
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' })

        const prompt = `
        Act as a medical AI assistant. Analyze the following symptoms provided by a patient:
        "${symptoms}"

        Detect the language of the patient's symptoms and provide all field values (title, summary, advice) in that same language. The keys (title, severity, summary, advice) must remain in English as defined below.

        Return the response in strictly valid JSON format with the following structure:
        {
            "title": "Potential Condition Name",
            "severity": "Low/Moderate/High",
            "summary": "Brief explanation of what might be happening.",
            "advice": "Actionable advice (e.g., rest, see a doctor, go to ER)."
        }

        Return ONLY a raw JSON string. Do not include markdown code blocks (like \`\`\`json), commentary, or any other text before or after the JSON object.
        `

        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()

        try {
            const start = text.indexOf('{')
            const end = text.lastIndexOf('}')
            if (start === -1 || end === -1) throw new Error('No JSON found')
            
            const cleanText = text.substring(start, end + 1)
            return { data: JSON.parse(cleanText) }
        } catch (parseError) {
            console.error('Gemini Symptom Parse Error:', parseError)
            return { error: 'Failed to process symptom analysis.' }
        }

    } catch (error: any) {
        console.error('Gemini Symptom Analysis Error:', error)
        let message = 'Failed to analyze symptoms.'
        if (error?.message?.includes('429')) message = 'Rate limit exceeded.'
        if (error?.message?.includes('404')) message = 'AI model not found. Check API key permissions.'
        
        return { error: message }
    }
}
