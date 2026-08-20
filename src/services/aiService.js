// 4-Tier AI Waterfall Service (Gemini 3.6 -> Groq Llama-3.3 -> DeepSeek -> OpenRouter Auto)

const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const GROQ_KEY = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
const DEEPSEEK_KEY = (import.meta.env.VITE_DEEPSEEK_API_KEY || '').trim();
const OPENROUTER_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();

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

  // Tier 1: Google Gemini 3.6 Flash
  if (GEMINI_KEY) {
    try {
      console.log("Tier 1: Calling Gemini 3.6 Flash...");
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${GEMINI_KEY}`,
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
        console.warn("Tier 1 Failed:", lastErrorMsg);
      }
    } catch (err) {
      lastErrorMsg = `Gemini error: ${err.message}`;
      console.warn("Tier 1 Exception:", lastErrorMsg);
    }
  }

  // Tier 2: Groq (Llama-3.3 70B)
  if (GROQ_KEY) {
    try {
      console.log("Tier 2: Calling Groq (Llama-3.3)...");
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
        console.warn("Tier 2 Failed:", lastErrorMsg);
      }
    } catch (err) {
      lastErrorMsg = `Groq error: ${err.message}`;
      console.warn("Tier 2 Exception:", lastErrorMsg);
    }
  }

  // Tier 3: DeepSeek API
  if (DEEPSEEK_KEY) {
    try {
      console.log("Tier 3: Calling DeepSeek API...");
      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${DEEPSEEK_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: SYSTEM_PROMPT(query) }],
          model: "deepseek-chat",
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
        lastErrorMsg = `DeepSeek HTTP ${res.status}: ${errData.error?.message || res.statusText}`;
        console.warn("Tier 3 Failed:", lastErrorMsg);
      }
    } catch (err) {
      lastErrorMsg = `DeepSeek error: ${err.message}`;
      console.warn("Tier 3 Exception:", lastErrorMsg);
    }
  }

  // Tier 4: OpenRouter API (Auto Model Selection)
  if (OPENROUTER_KEY) {
    try {
      console.log("Tier 4: Calling OpenRouter...");
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          messages: [{ role: "user", content: SYSTEM_PROMPT(query) }],
          model: "openrouter/auto",
          response_format: { type: "json_object" }
        })
      });

      if (res.ok) {
        const data = await res.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const cleanJSON = content.replace(/```json|```/gi, "").trim();
          return JSON.parse(cleanJSON);
        }
      } else {
        const errData = await res.json().catch(() => ({}));
        lastErrorMsg = `OpenRouter HTTP ${res.status}: ${errData.error?.message || res.statusText}`;
        console.warn("Tier 4 OpenRouter Failed:", lastErrorMsg);
      }
    } catch (err) {
      console.warn("Tier 4 OpenRouter Exception:", err.message);
    }
  }

  return generateFallbackError(
    query,
    lastErrorMsg || "All AI waterfall providers are currently busy. Please verify environment variables in Vercel."
  );
};

const generateFallbackError = (query, errorMsg) => {
  return {
    conditionName: `${query} (Error)`,
    specialty: "System Error",
    system: "System Error",
    history: [errorMsg],
    exam: ["Please check your network connection or verify API keys in Vercel settings."],
    investigations: {
      bedside: [],
      bloods: [],
      imaging: [],
      specialTests: []
    },
    differentials: [],
    redFlags: [],
    osceInfo: {
      keyTips: [],
      examinerQuestions: []
    }
  };
};
