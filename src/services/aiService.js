import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// API Keys with .trim() to ensure no whitespace/space issues from Vercel env vars
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.trim() : '';
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY ? import.meta.env.VITE_GROQ_API_KEY.trim() : '';

const SYSTEM_PROMPT = (query) => `You are an expert Senior Medical Consultant teaching medical students to clerk patients on the ward.
The user has searched for: "${query}"

If it is a disease, provide the guide. If symptoms, determine the primary suspected diagnosis.

SYNTHESIZE LATEST CLINICAL KNOWLEDGE.
OUTPUT ONLY VALID JSON MATCHING THIS EXACT SCHEMA:

{
  "conditionName": "Formal medical name",
  "specialty": "e.g. Cardiology | Emergency",
  "system": "The body system",
  "history": [
    "4-6 crucial PC/HPC details"
  ],
  "exam": [
    "4-6 specific examination signs"
  ],
  "investigations": {
    "bedside": ["2-3 items"],
    "bloods": ["2-3 items"],
    "imaging": ["2-3 items"],
    "specialTests": ["1-2 items"]
  },
  "differentials": [
    { "name": "Diagnosis", "rationale": "Short mimic reason (e.g. 'similar pain but no troponin rise')" }
  ],
  "redFlags": [
    "2-4 critical signs"
  ],
  "osceInfo": {
    "keyTips": ["2-3 high-yield tips"],
    "examinerQuestions": ["2-3 common questions to prepare for"]
  }
}`;

export const generateClerkingGuide = async (query) => {
  // 1. Attempt Gemini First (try gemini-2.0-flash then gemini-1.5-flash)
  if (GEMINI_KEY) {
    const geminiModels = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-2.5-flash"];
    for (const modelName of geminiModels) {
      try {
        console.log(`Attempting Gemini AI (${modelName})...`);
        const genAI = new GoogleGenerativeAI(GEMINI_KEY);
        const model = genAI.getGenerativeModel({ 
          model: modelName,
          generationConfig: { responseMimeType: "application/json" }
        });

        const result = await model.generateContent(SYSTEM_PROMPT(query));
        const responseText = result.response.text();
        const cleanJSON = responseText.replace(/```json|```/gi, '').trim();
        return JSON.parse(cleanJSON);
      } catch (error) {
        console.warn(`Gemini (${modelName}) Error:`, error.message);
      }
    }
  }

  // 2. Waterfall to Groq (Llama-3)
  if (GROQ_KEY) {
    try {
      console.log("Attempting Groq (Llama-3) Fallback...");
      const groq = new Groq({ 
        apiKey: GROQ_KEY,
        dangerouslyAllowBrowser: true
      });

      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "user",
            content: SYSTEM_PROMPT(query),
          },
        ],
        model: "llama-3.3-70b-versatile",
        response_format: { type: "json_object" }
      });

      const responseContent = completion.choices[0]?.message?.content;
      return JSON.parse(responseContent);

    } catch (error) {
      console.error("Groq Fallback Error:", error);
      return generateFallbackError(query, `AI services failed. Details: ${error.message ? error.message.substring(0, 100) : "Connection error"}`);
    }
  }

  return generateFallbackError(query, "No AI configuration found. Please verify environment variables in Vercel.");
};

const generateFallbackError = (query, errorMsg) => {
  return {
    conditionName: `${query} (Error)`,
    system: "System Error",
    history: [errorMsg],
    exam: ["Please verify your API key and network connection."],
    investigations: {
      bedside: [],
      bloods: [],
      imaging: []
    },
    differentials: [],
    redFlags: [],
    osceTips: []
  };
};
