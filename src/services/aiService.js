// Direct REST calls to Gemini and Groq APIs for maximum browser & Vercel compatibility
const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const GROQ_KEY = (import.meta.env.VITE_GROQ_API_KEY || '').trim();

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
  let lastErrorMsg = "";

  // Check if API keys exist
  if (!GEMINI_KEY && !GROQ_KEY) {
    return generateFallbackError(
      query,
      "No API Keys found on Vercel. Please check VITE_GEMINI_API_KEY or VITE_GROQ_API_KEY in Vercel Environment Settings."
    );
  }

  // 1. Try Gemini REST API directly
  if (GEMINI_KEY) {
    const models = ["gemini-1.5-flash", "gemini-2.0-flash", "gemini-1.5-pro"];
    for (const model of models) {
      try {
        console.log(`Calling Gemini REST API (${model})...`);
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: SYSTEM_PROMPT(query) }] }],
              generationConfig: { responseMimeType: "application/json" }
            })
          }
        );

        if (res.ok) {
          const data = await res.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) {
            const cleanJSON = text.replace(/```json|```/gi, "").trim();
            return JSON.parse(cleanJSON);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          lastErrorMsg = `Gemini HTTP ${res.status}: ${errData.error?.message || res.statusText}`;
          console.warn(lastErrorMsg);
        }
      } catch (err) {
        lastErrorMsg = `Gemini fetch failed: ${err.message}`;
        console.warn(lastErrorMsg);
      }
    }
  }

  // 2. Fallback to Groq REST API directly
  if (GROQ_KEY) {
    try {
      console.log("Calling Groq REST API...");
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: SYSTEM_PROMPT(query) }],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          return JSON.parse(content);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        lastErrorMsg = `Groq HTTP ${res.status}: ${errData.error?.message || res.statusText}`;
        console.warn(lastErrorMsg);
      }
    } catch (err) {
      lastErrorMsg = `Groq fetch failed: ${err.message}`;
      console.warn(lastErrorMsg);
    }
  }

  return generateFallbackError(query, lastErrorMsg || "Connection failed. Please check network/API keys.");
};

const generateFallbackError = (query, errorMsg) => {
  return {
    conditionName: `${query} (Error)`,
    system: "System Error",
    history: [errorMsg],
    exam: ["Please check browser console or verify your API keys in Vercel."],
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
