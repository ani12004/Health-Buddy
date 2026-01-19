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

export async function generateMedicalReportContent(patientName: string) {
  const prompt = `
    Generate a PROFESSIONAL HOSPITAL-GRADE MEDICAL REPORT API RESPONSE for a patient named "${patientName}".
    
    RETURN ONLY RAW JSON. DO NOT USE MARKDOWN BLOCK.
    
    Structure:
    {
      "patientDetails": {
        "age": "number (approx 30-50)",
        "gender": "string (Male/Female)",
        "id": "string (e.g. HB-78291)",
        "referringDoctor": "Dr. Sarah Smith, MD"
      },
      "clinicalSummary": "Professional medical summary of general health status. Mention mild stress but good physical trends. Use hospital-grade phrasing.",
      "vitals": [
        { "parameter": "Blood Pressure", "value": "120/80 mmHg", "referenceRange": "90/60 - 120/80", "interpretation": "Normal" },
        { "parameter": "Heart Rate", "value": "72 bpm", "referenceRange": "60-100 bpm", "interpretation": "Normal" },
        { "parameter": "Oxygen Saturation", "value": "98%", "referenceRange": "95-100%", "interpretation": "Optimal" },
        { "parameter": "BMI", "value": "24.5", "referenceRange": "18.5-24.9", "interpretation": "Healthy Weight" }
      ],
      "riskAssessment": {
        "level": "LOW",
        "details": "Overall cardiovascular and metabolic risk is low. Stress levels indicate need for mindfulness."
      },
      "recommendations": {
        "stressManagement": ["Daily mindfulness meditation (10 mins)", "Breathing exercises"],
        "sleep": ["Maintain 7-8 hours sleep schedule", "Avoid blue light before bed"],
        "activity": ["30 mins moderate cardio 4x/week", "Hourly stretching"],
        "habits": ["Increase water intake to 3L/day", "Reduce caffeine intake"]
      }
    }
  `;
  const response = await generateHealthInsight(prompt);
  try {
    // Clean up if the AI wraps in markdown code blocks
    const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (e) {
    console.error("Failed to parse AI JSON", e);
    return null;
  }
}
