import { createFileRoute } from "@tanstack/react-router";

interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

// Short system prompt to save tokens.
const SYSTEM_INSTRUCTION =
  "You are MedhaRank AI Tutor. Explain admission topics simply in Bangla or English. Keep answers short, exam-focused, and easy to learn. No greetings or filler. Don't repeat the question. Use bullet points when useful. Answer in the user's language. Expand only if the user asks for details.";

const GREETING_RE = /^(hi|hello|hey|salam|assalam|হাই|হ্যালো|হ্যালু|কেমন আছো|কেমন আছেন|thanks?|thank you|ok|okay)\b/i;

function classify(text: string): { mode: "greeting" | "simple" | "bangla" | "practice" | "detailed" | "normal"; maxTokens: number } {
  const t = text.trim();
  if (t.length < 20 && GREETING_RE.test(t)) return { mode: "greeting", maxTokens: 80 };
  if (/detail|explain in detail|বিস্তারিত|details?|elaborate|long/i.test(t)) return { mode: "detailed", maxTokens: 500 };
  if (/practice|mcq.*(make|create|generate|বানা)/i.test(t)) return { mode: "practice", maxTokens: 400 };
  if (/বাংলা|bangla|bengali/i.test(t) || /[\u0980-\u09FF]/.test(t)) return { mode: "bangla", maxTokens: 400 };
  if (t.length < 60) return { mode: "simple", maxTokens: 300 };
  return { mode: "normal", maxTokens: 400 };
}

// Trim history: only the latest user message + at most 1 prior assistant turn for context.
function trimHistory(messages: ChatMessage[]): ChatMessage[] {
  const nonSystem = messages.filter((m) => m.role !== "system");
  if (nonSystem.length === 0) return [];
  // Take last 3 messages max (e.g. user, assistant, user) — short context window.
  const tail = nonSystem.slice(-3);
  // Truncate any single message to ~1500 chars to cap input tokens.
  return tail.map((m) => ({
    ...m,
    content: m.content.length > 1500 ? m.content.slice(-1500) : m.content,
  }));
}

async function callGemini(apiKey: string, messages: ChatMessage[], maxTokens: number): Promise<string> {
  const contents = messages
    .map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
  const model = "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: maxTokens },
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Gemini ${res.status}: ${t}`);
  }
  const data = (await res.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const reply =
    data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  if (!reply.trim()) throw new Error("Gemini: empty response");
  return reply;
}

async function callGroq(apiKey: string, messages: ChatMessage[], maxTokens: number): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.3,
      max_tokens: maxTokens,
      messages: [
        { role: "system", content: SYSTEM_INSTRUCTION },
        ...messages,
      ],
    }),
  });
  if (!res.ok) {
    const t = await res.text();
    throw new Error(`Groq ${res.status}: ${t}`);
  }
  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const reply = data.choices?.[0]?.message?.content ?? "";
  if (!reply.trim()) throw new Error("Groq: empty response");
  return reply;
}

async function callOpenRouter(apiKey: string, messages: ChatMessage[], maxTokens: number): Promise<string> {
  // Free models only — must end with :free
  const freeModels = [
    "google/gemini-2.0-flash-exp:free",
    "meta-llama/llama-3.3-70b-instruct:free",
    "mistralai/mistral-7b-instruct:free",
  ];
  let lastErr: unknown = null;
  for (const model of freeModels) {
    if (!model.endsWith(":free")) continue;
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://medharank.lovable.app",
          "X-Title": "MedhaRank AI Tutor",
        },
        body: JSON.stringify({
          model,
          temperature: 0.3,
          max_tokens: maxTokens,
          messages: [
            { role: "system", content: SYSTEM_INSTRUCTION },
            ...messages,
          ],
        }),
      });
      if (!res.ok) {
        const t = await res.text();
        throw new Error(`OpenRouter[${model}] ${res.status}: ${t}`);
      }
      const data = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const reply = data.choices?.[0]?.message?.content ?? "";
      if (!reply.trim()) throw new Error(`OpenRouter[${model}]: empty response`);
      return reply;
    } catch (e) {
      console.error("[ai-teacher] OpenRouter model failed:", e);
      lastErr = e;
    }
  }
  throw lastErr ?? new Error("OpenRouter: all free models failed");
}

export const Route = createFileRoute("/api/ai-teacher-chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let payload: { messages?: ChatMessage[]; model?: string };
        try {
          payload = await request.json();
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const messages = Array.isArray(payload.messages) ? payload.messages : [];
        if (messages.length === 0) {
          return Response.json({ error: "messages array is required." }, { status: 400 });
        }

        const trimmed = trimHistory(messages);
        const lastUser = [...trimmed].reverse().find((m) => m.role === "user")?.content ?? "";
        const { mode, maxTokens } = classify(lastUser);

        // Greetings: skip provider call entirely, return canned short reply (0 tokens used).
        if (mode === "greeting") {
          return Response.json({
            reply: "Hi! Ask me any admission question — MCQ, concept, shortcut, or Bangla explanation.",
            provider: "local",
            mode,
          });
        }

        const providers: { name: string; key: string | undefined; run: (k: string) => Promise<string> }[] = [
          { name: "Gemini", key: process.env.GEMINI_API_KEY, run: (k) => callGemini(k, trimmed, maxTokens) },
          { name: "Groq", key: process.env.GROQ_API_KEY, run: (k) => callGroq(k, trimmed, maxTokens) },
          { name: "OpenRouter", key: process.env.OPENROUTER_API_KEY, run: (k) => callOpenRouter(k, trimmed, maxTokens) },
        ];

        const errors: string[] = [];
        for (const p of providers) {
          if (!p.key) {
            console.warn(`[ai-teacher] ${p.name} skipped: no API key configured`);
            errors.push(`${p.name}: no API key`);
            continue;
          }
          try {
            console.log(`[ai-teacher] Trying ${p.name} (mode=${mode}, maxTokens=${maxTokens})…`);
            const reply = await p.run(p.key);
            console.log(`[ai-teacher] ${p.name} succeeded`);
            return Response.json({ reply, provider: p.name, mode });
          } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`[ai-teacher] ${p.name} failed:`, msg);
            errors.push(`${p.name}: ${msg.slice(0, 200)}`);
          }
        }

        console.error("[ai-teacher] All providers failed:", errors);
        return Response.json(
          { error: "AI Tutor is temporarily unavailable. Please try again later." },
          { status: 503 },
        );
      },
    },
  },
});
