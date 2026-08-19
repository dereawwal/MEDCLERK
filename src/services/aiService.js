import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';

// API Keys
const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GROQ_KEY = import.meta.env.VITE_GROQ_API_KEY;

const SYSTEM_PROMPT = (query) => `You are an expert Senior Medical Consultant teaching medical students to clerk patients on the ward.
The user has searched for: "${query}"

If it is a disease, provide the guide. If symptoms, determine the primary suspected diagnosis.

SYTHESIZE LATEST CLINICAL KNOWLEDGE.
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
  // 1. Attempt Gemini First
  if (GEMINI_KEY) {
    try {
      console.log("Attempting Gemini AI...");
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        generationConfig: { responseMimeType: "application/json" }
      });

      const result = await model.generateContent(SYSTEM_PROMPT(query));
      const responseText = result.response.text();
      const cleanJSON = responseText.replace(/```json|```/gi, '').trim();
      return JSON.parse(cleanJSON);

    } catch (error) {
      console.warn("Gemini Error or Rate Limit. Falling back to Groq...", error.message);
      // If error is 429 or any other issue, we immediately proceed to the Groq block below
    }
  }

  // 2. Waterfall to Groq (Llama-3)
  if (GROQ_KEY) {
    try {
      console.log("Attempting Groq (Llama-3) Fallback...");
      const groq = new Groq({ 
        apiKey: GROQ_KEY,
        dangerouslyAllowBrowser: true // Required for client-side API calls
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
      return generateFallbackError(query, `Primary (Gemini) and Fallback (Groq) failed. Error: ${error.message.substring(0, 100)}`);
    }
  }

  return generateFallbackError(query, "No AI configuration found. Please verify VITE_GEMINI_API_KEY or VITE_GROQ_API_KEY.");
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
