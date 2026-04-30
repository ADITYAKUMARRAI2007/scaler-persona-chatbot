import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";
import { getPersona } from "../../lib/personas";

type ChatMessage = { role: "user" | "assistant"; content: string };

export const runtime = "nodejs";

const MAX_HISTORY_MESSAGES = 16;

export async function POST(req: NextRequest) {
  try {
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
    const modelName = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";
    const model = genAI.getGenerativeModel({
      model: modelName,
      systemInstruction: persona.systemPrompt,
    });

    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history });
    const result = await chat.sendMessage(latest.content);
    const text = result.response.text();
    return NextResponse.json(
      { reply: text, persona: persona.id, model: modelName },
      { headers: { "X-LLM-Provider": "gemini", "X-LLM-Model": modelName } }
    );
  } catch (error) {
    console.error("Chat API error", error);
    const message = error instanceof Error ? error.message : String(error);
    const isQuota = message.includes("429") || message.toLowerCase().includes("quota") || message.toLowerCase().includes("too many requests");
    const isModelMissing = message.includes("404") || message.includes("not found") || message.includes("ListModels");

    return NextResponse.json(
      {
        error: isQuota
          ? "Gemini quota/rate limit reached for this API key. Wait about 1 minute and try again, or use GEMINI_MODEL=gemini-2.5-flash-lite / a key with quota."
          : isModelMissing
            ? "The configured Gemini model is not available for this API key. Try GEMINI_MODEL=gemini-2.5-flash-lite in .env.local, then restart npm run dev."
            : "The AI service is temporarily unavailable. Check your API key or try again in a minute.",
      },
      { status: 500 }
    );
  }
}
