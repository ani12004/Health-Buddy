import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn('GEMINI_API_KEY is not set');
}

const genAI = new GoogleGenerativeAI(apiKey || '');

export const geminiModel = genAI.getGenerativeModel({
    model: 'gemini-1.5-pro', // or gemini-pro depending on availability
});

export async function generateHealthInsight(prompt: string) {
    try {
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error('Error generating health insight:', error);
        return 'Sorry, I could not generate a health insight at this time.';
    }
}
