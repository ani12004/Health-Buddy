const { GoogleGenerativeAI } = require('@google/generative-ai');

async function runFullTestSuite() {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        console.error('Error: GEMINI_API_KEY environment variable is not set.');
        console.log('Please set it in your environment or run with: node --env-file=.env.local test-gemini.js');
        process.exit(1);
    }
    const genAI = new GoogleGenerativeAI(key);

    console.log('--- STARTING FULL AI SUITE VERIFICATION ---');

    // 1. AI Checkup (gemini-3.1-pro-preview) - Case 1: High Risk
    try {
        console.log('\n[1/3] Testing AI Checkup (gemini-3.1-pro-preview)...');
        const checkupModel = genAI.getGenerativeModel({ model: 'gemini-3.1-pro-preview' });
        const checkupData = {
            age: 58, sex: 'Male', bmi: 31.5, waist_circumference: 104,
            systolic_bp: 155, diastolic_bp: 95, resting_heart_rate: 84,
            heart_disease: false, hypertension: true,
            total_cholesterol: 245, ldl: 160, hdl: 35, triglycerides: 200,
            fasting_glucose: 110, hba1c: 6.2,
            smoker: 'Regular Smoker', physical_activity_level: 'Sedentary',
            stress_level: 'High', salt_intake: 'High'
        };
        const checkupPrompt = `Return JSON analysis for: ${JSON.stringify(checkupData)}. Format: {predictions: [], overallAssessment: "", suggestions: [], disclaimer: ""}`;
        const result = await checkupModel.generateContent(checkupPrompt);
        console.log('CHECKUP RESULT:', result.response.text());
    } catch (e) { console.error('Checkup Failed:', e.message); }

    // 2. AI Chat (gemini-3-flash)
    try {
        console.log('\n[2/3] Testing AI Chat (gemini-3-flash)...');
        const chatModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const chatResult = await chatModel.generateContent('Explain the signs of a heart attack briefly.');
        console.log('CHAT RESULT:', chatResult.response.text());
    } catch (e) { console.error('Chat Failed:', e.message); }

    // 3. Symptom Analysis (gemini-2.5-flash)
    try {
        console.log('\n[3/3] Testing Symptom Analysis (gemini-2.5-flash)...');
        const symptomModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
        const symptomPrompt = `Analyze symptoms: "Sharp chest pain radiating to left arm". Return JSON: {title, severity, summary, advice}`;
        const symResult = await symptomModel.generateContent(symptomPrompt);
        console.log('SYMPTOM RESULT:', symResult.response.text());
    } catch (e) { console.error('Symptom Failed:', e.message); }

    console.log('\n--- VERIFICATION COMPLETE ---');
}

runFullTestSuite();
