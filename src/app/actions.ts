'use server';

import { generateHealthInsight } from '@/lib/gemini';

export async function getDailyHealthTip() {
  const prompt = "Generate a short, calming, and medically safe daily health tip for a patient. Keep it under 50 words. Use a reassured tone.";
  return await generateHealthInsight(prompt);
}

export async function analyzeSymptoms(symptoms: string) {
  const prompt = `
    A patient is reporting the following symptoms: "${symptoms}".
    
    As Health Buddy, provide a calm, non-alarmist analysis.
    1. Acknowledge the symptoms.
    2. Provide general wellness advice (hydration, rest).
    3. Suggest if they should see a doctor (use standard medical triage logic but do not diagnose).
    
    IMPORTANT:
    - Do NOT provide a medical diagnosis.
    - Always include a disclaimer: "I am an AI, not a doctor. Please consult a professional for medical advice."
    - Keep the tone reassuring and safe.
  `;
  return await generateHealthInsight(prompt);
}

export async function chatWithAI(history: { role: string; content: string }[], message: string) {
  // Construct a prompt with history
  const context = history.map(m => `${m.role}: ${m.content}`).join('\n');
  const prompt = `
    You are Health Buddy, a helpful medical AI assistant.
    Current conversation:
    ${context}
    User: ${message}
    
    Provide a helpful, concise response (max 2 sentences).
    Do NOT diagnose.
  `;
  return await generateHealthInsight(prompt);
}

export async function generateMedicalReportContent() {
  const prompt = `
    Generate a professional medical report summary for a patient named Alex based on general health data (mock data: mild stress, good hydration, regular sleep).
    
    Structure:
    1. Patient Summary
    2. Vital Signs Overview (Mock BP: 120/80, HR: 72)
    3. AI Risk Analysis (Low Risk)
    4. Lifestyle Recommendations
    
    Tone: Formal, Hospital-grade, Reassuring. 
    Format: Plain Text with clear section headers.
  `;
  return await generateHealthInsight(prompt);
}
