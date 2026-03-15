// ML Bridge — HTTP REST client
// Calls the Python FastAPI microservice instead of spawning a subprocess.
// Set ML_API_URL in your .env.local (local) and Vercel env vars (production).

const ML_API_URL = process.env.ML_API_URL || 'https://anilsuthar2004-health-buddy-ai.hf.space'

export async function runMLBridge(input: any): Promise<any> {
    try {
        const res = await fetch(`${ML_API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
            // 30s timeout — ML inference can be slow on cold start
            signal: AbortSignal.timeout(30_000),
        })

        if (!res.ok) {
            const err = await res.json().catch(() => ({ detail: 'Unknown error' }))
            console.error('ML API error:', err)
            return { error: err.detail || 'ML Service returned an error' }
        }

        return await res.json()
    } catch (error: any) {
        console.error('ML Bridge fetch error:', error.message)
        // Return a graceful fallback so Gemini still runs without ML scores
        return { error: 'ML Service unavailable. Check ML_API_URL env var.' }
    }
}
