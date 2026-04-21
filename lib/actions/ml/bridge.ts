// ML Bridge v10 — HTTP REST client
// Calls the Python FastAPI microservice on Hugging Face Spaces

const ML_API_URL = process.env.ML_API_URL || 'https://anilsuthar2004-health-buddy-ml.hf.space'

export interface MLInput {
    age: number
    sex: 'Male' | 'Female'
    bmi: number
    waist: number
    systolic_bp: number
    diastolic_bp: number
    heart_rate: number
    history: 'Yes' | 'None'
    total_cholesterol: number
    ldl: number
    hdl: number
    triglycerides: number
    fasting_glucose: number
    hba1c: number
    smoking: 'Non-Smoker' | 'Former Smoker' | 'Regular Smoker' | 'Heavy Smoker'
    activity: 'Sedentary' | 'Light' | 'Moderate' | 'Active' | 'Very Active'
    stress: 'Low' | 'Moderate' | 'High'
    salt_intake: 'Low' | 'Medium' | 'High'
}

export interface RiskDriver {
    feature: string
    label: string
    shap: number
    value: number
}

export interface DiseaseResult {
    risk_percent: number
    risk_level: 'LOW' | 'MODERATE' | 'HIGH'
    confidence: number
    raw_probability: number
    calibrated_probability: number
    model_probabilities: {
        lr: number
        xgb: number
        lgbm: number
        nn: number
        hgb: number
        cat: number
    }
    threshold: number
    calibration_method: string
    top_risk_drivers: RiskDriver[]
    protective_factors: RiskDriver[]
}

export interface MLResult {
    'Heart Disease': DiseaseResult
    'Hypertension': DiseaseResult
    'Diabetes': DiseaseResult
    health_score: number
    version: string
    ensemble: string
}

export async function runMLBridge(input: MLInput): Promise<MLResult | { error: string }> {
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
        return { error: 'ML Service unavailable. The service may be starting up - please try again in a moment.' }
    }
}

export async function checkMLHealth(): Promise<boolean> {
    try {
        const res = await fetch(`${ML_API_URL}/health`, {
            method: 'GET',
            signal: AbortSignal.timeout(5_000),
        })
        return res.ok
    } catch {
        return false
    }
}
