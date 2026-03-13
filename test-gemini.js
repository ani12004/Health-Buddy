const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testNewModels() {
    const key = 'AIzaSyAzgCpqT8Msl6UDwdRws13QU7Rbl9aZz8k';
    console.log('Testing New Gemini Models (2.5 & 3 series)...');
    
    const genAI = new GoogleGenerativeAI(key);
    const modelsToTest = [
        'gemini-3.1-pro-preview',
        'gemini-3-flash',
        'gemini-2.5-pro',
        'gemini-2.5-flash'
    ];

    for (const modelName of modelsToTest) {
        try {
            console.log(`Checking ${modelName}...`);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('ping');
            const response = await result.response;
            console.log(`SUCCESS: ${modelName} responded: ${response.text().substring(0, 50)}...`);
        } catch (err) {
            console.log(`FAILED: ${modelName} - ${err.message}`);
        }
    }
}

testNewModels();
