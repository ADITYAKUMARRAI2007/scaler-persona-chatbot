import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { getPersona } from "../../lib/personas";

type ChatMessage = { role: "user" | "assistant"; content: string };

export const runtime = "nodejs";

const MAX_HISTORY_MESSAGES = 8;
const DEFAULT_MODEL = "gemini-2.5-flash-lite";
const DEFAULT_FALLBACK_MODELS = ["gemini-2.0-flash-lite", "gemma-3-4b-it"];
const modelCooldownUntil = new Map<string, number>();

function isQuotaError(message: string) {
  return message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("too many requests");
}

function isModelMissingError(message: string) {
  return message.includes("404") || message.includes("not found") || message.includes("ListModels");
}

function isRetryableProviderError(message: string) {
  return isQuotaError(message) || isModelMissingError(message) || message.toLowerCase().includes("fetch failed");
}

function supportsSystemInstruction(modelName: string) {
  return !modelName.startsWith("gemma-");
}

function retryDelayMs(message: string) {
  const retrySeconds = message.match(/retry(?:Delay| in)?[\s\S]{0,40}?(\d+(?:\.\d+)?)s/i)?.[1];
  if (retrySeconds) return Math.ceil(Number(retrySeconds) * 1000);
  return 60_000;
}

function isCoolingDown(modelName: string) {
  return (modelCooldownUntil.get(modelName) || 0) > Date.now();
}

function isSupabaseAuthEnabled() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

async function requireAuthenticatedUser(req: NextRequest) {
  if (!isSupabaseAuthEnabled()) return null;

  const token = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) {
    return NextResponse.json({ error: "Please sign in before chatting." }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  );
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) {
    return NextResponse.json({ error: "Your login session expired. Please sign in again." }, { status: 401 });
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const authError = await requireAuthenticatedUser(req);
    if (authError) return authError;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "The server is missing GEMINI_API_KEY. Add it to your environment variables." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const persona = getPersona(body.personaId);
    const rawMessages = Array.isArray(body.messages) ? (body.messages as ChatMessage[]) : [];
    const messages = rawMessages
      .filter((m) => (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
      .slice(-MAX_HISTORY_MESSAGES);
    const latest = messages[messages.length - 1];
    if (!latest || latest.role !== "user" || !latest.content?.trim()) {
      return NextResponse.json({ error: "Please send a non-empty user message." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const primaryModel = process.env.GEMINI_MODEL || DEFAULT_MODEL;
    const fallbackModels = (process.env.GEMINI_FALLBACK_MODELS || DEFAULT_FALLBACK_MODELS.join(","))
      .split(",")
      .map((model) => model.trim())
      .filter(Boolean);
    const modelCandidates = Array.from(new Set([primaryModel, ...fallbackModels])).filter((model) => !isCoolingDown(model));

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    let lastError: unknown;
    for (const modelName of modelCandidates) {
      try {
        const hasSystemInstruction = supportsSystemInstruction(modelName);
        const model = genAI.getGenerativeModel({
          model: modelName,
          ...(hasSystemInstruction ? { systemInstruction: persona.systemPrompt } : {}),
          generationConfig: {
            maxOutputTokens: 420,
            temperature: 0.75,
          },
        });

        const modelHistory = hasSystemInstruction
          ? history
          : [
              {
                role: "user",
                parts: [
                  {
                    text: `System instructions for this educational persona simulation:\n${persona.systemPrompt}`,
                  },
                ],
              },
              {
                role: "model",
                parts: [{ text: "Understood. I will follow this persona prompt and only return final user-facing answers." }],
              },
              ...history,
            ];

        const chat = model.startChat({ history: modelHistory });
        const result = await chat.sendMessage(latest.content);
        const text = result.response.text();
        return NextResponse.json(
          { reply: text, persona: persona.id, model: modelName },
          { headers: { "X-LLM-Provider": "gemini", "X-LLM-Model": modelName } }
        );
      } catch (error) {
        lastError = error;
        const message = error instanceof Error ? error.message : String(error);
        if (isQuotaError(message)) {
          modelCooldownUntil.set(modelName, Date.now() + retryDelayMs(message));
        }
        if (!isRetryableProviderError(message)) throw error;
      }
    }

    if (!lastError && modelCandidates.length === 0) {
      throw new Error("All configured Gemini models are temporarily cooling down after quota/rate-limit errors.");
    }
    throw lastError;
  } catch (error) {
    console.error("Chat API error", error);
    const message = error instanceof Error ? error.message : String(error);
    const isQuota = isQuotaError(message);
    const isModelMissing = isModelMissingError(message);

    return NextResponse.json(
      {
        error: isQuota
          ? "Gemini quota/rate limit reached for this API key across the configured fallback models. Wait a few minutes, reduce rapid testing, or use another Gemini API key with quota."
          : isModelMissing
            ? "The configured Gemini model is not available for this API key. Try GEMINI_MODEL=gemini-2.5-flash-lite in .env.local, then restart npm run dev."
            : "The AI service is temporarily unavailable. Check your API key or try again in a minute.",
      },
      { status: 500 }
    );
  }
}
