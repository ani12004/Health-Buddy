const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
    const key = 'AIzaSyAzgCpqT8Msl6UDwdRws13QU7Rbl9aZz8k';
    console.log('Listing available models for API Key: AIzaSy...');

    try {
        const genAI = new GoogleGenerativeAI(key);
        // The SDK doesn't have a direct listModels, we have to use the REST API or another way.
        // But we can try a few common names.
        const models = ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-pro', 'gemini-1.0-pro'];

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent('ping');
                const response = await result.response;
                console.log(`Model ${modelName}: SUCCESS - ${response.text()}`);
                return; // Stop at first working model
            } catch (err) {
                console.log(`Model ${modelName}: FAILED - ${err.message}`);
            }
        }
    } catch (error) {
        console.error('List Models failed:', error.message);
    }
}

listModels();
