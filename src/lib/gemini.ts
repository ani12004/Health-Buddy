import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(apiKey || 'missing-key');

export const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-flash-latest',
});

export async function generateHealthInsight(prompt: string) {
    if (!apiKey) return "Configuration Error: GEMINI_API_KEY is missing.";

    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error: any) {
        console.error('Error generating health insight:', error);
        return `AI Error: ${error.message || 'Service unavailable'}`;
    }
}
