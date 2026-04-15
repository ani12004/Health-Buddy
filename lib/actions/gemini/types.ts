export interface HealthInput {
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

export interface DiseaseSummary {
    risk_percent: number
    risk_level: 'LOW' | 'MODERATE' | 'HIGH'
}

export interface GeminiMLResult {
    'Heart Disease': DiseaseSummary
    'Hypertension': DiseaseSummary
    'Diabetes': DiseaseSummary
}
