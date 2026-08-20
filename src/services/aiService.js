// High-Speed 3-Tier AI Waterfall Service (Gemini 3.6 -> Groq -> OpenRouter)
import { getCachedGuide } from './storageService';

const GEMINI_KEY = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
const GROQ_KEY = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
const OPENROUTER_KEY = (import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();

const SYSTEM_PROMPT = (query) => `You are a Senior Medical Consultant teaching medical students to clerk ward patients.
Search: "${query}"

Return concise, high-yield clinical data in EXACT JSON:

{
  "conditionName": "Formal medical name",
  "specialty": "Specialty name",
  "system": "Body system",
  "history": ["4-5 high-yield PC/HPC points"],
  "exam": ["4-5 key signs"],
  "investigations": {
    "bedside": ["2 key bedside tests"],
    "bloods": ["2 key blood tests"],
    "imaging": ["1-2 key imaging tests"],
    "specialTests": ["1 test"]
  },
  "differentials": [
    { "name": "Diagnosis", "rationale": "Short mimic reason" }
  ],
  "redFlags": ["2-3 red flags"],
  "osceInfo": {
    "keyTips": ["2 key tips"],
    "examinerQuestions": ["2 common questions"]
  }
}`;

export const generateClerkingGuide = async (query) => {
  if (!query) return null;

  // 0. Check Instant Local Cache (0ms latency response!)
  const cached = getCachedGuide(query);
  if (cached) {
    console.log(`⚡ Instant 0ms cache hit for: ${query}`);
    return cached;
  }

  let lastErrorMsg = "";

  // Tier 1: Google Gemini 3.6 Flash (Fast mode)
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
            generationConfig: {
              responseMimeType: "application/json",
              temperature: 0.1,
              maxOutputTokens: 800
            }
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

  // Tier 2: Groq (GPT-OSS 120B / Qwen 27B - Superfast inference)
  if (GROQ_KEY) {
    const groqModels = ["openai/gpt-oss-120b", "qwen/qwen3.6-27b", "openai/gpt-oss-20b"];
    for (const model of groqModels) {
      try {
        console.log(`Tier 2: Calling Groq (${model})...`);
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${GROQ_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: SYSTEM_PROMPT(query) }],
            model: model,
            temperature: 0.1,
            max_tokens: 800,
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
          console.warn(`Tier 2 Groq (${model}) Failed:`, lastErrorMsg);
        }
      } catch (err) {
        lastErrorMsg = `Groq error: ${err.message}`;
        console.warn("Tier 2 Exception:", lastErrorMsg);
      }
    }
  }

  // Tier 3: OpenRouter API (Auto Free Models)
  if (OPENROUTER_KEY) {
    const openrouterModels = ["openrouter/auto", "meta-llama/llama-3.3-70b-instruct:free", "google/gemini-2.0-flash-lite-001:free"];
    for (const model of openrouterModels) {
      try {
        console.log(`Tier 3: Calling OpenRouter (${model})...`);
        const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            messages: [{ role: "user", content: SYSTEM_PROMPT(query) }],
            model: model,
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
          console.warn(`Tier 3 OpenRouter (${model}) Failed:`, lastErrorMsg);
        }
      } catch (err) {
        console.warn("Tier 3 OpenRouter Exception:", err.message);
      }
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
