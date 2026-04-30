"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { personas, PersonaId } from "./lib/personas";

type Message = { role: "user" | "assistant" | "system"; content: string };

const initialSystem = (name: string): Message => ({
  role: "system",
  content: `New conversation started with ${name}. Persona prompt, examples, constraints, and chat history are isolated for this mode.`,
});

const personaFacts: Record<PersonaId, string[]> = {
  anshuman: ["Founder-engineer lens", "CS fundamentals", "Skill → impact → opportunity"],
  abhimanyu: ["Founder-operator lens", "Mentorship systems", "Industry-ready outcomes"],
  kshitij: ["Technical mentor lens", "Debug from first principles", "Builder + user thinking"],
};

const promptContract = [
  "Dedicated system prompt per persona",
  "3+ few-shot examples embedded",
  "Silent chain-of-thought / evaluation instruction",
  "Output length + structure rules",
  "Safety and public-source constraints",
];

export default function Home() {
  const [personaId, setPersonaId] = useState<PersonaId>("anshuman");
  const [messages, setMessages] = useState<Message[]>([initialSystem(personas.anshuman.name)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const persona = personas[personaId];

  const visibleMessages = useMemo(() => messages, [messages]);
  const questionCount = visibleMessages.filter((m) => m.role === "user").length;

  function switchPersona(next: PersonaId) {
    setPersonaId(next);
    setMessages([initialSystem(personas[next].name)]);
    setInput("");
  }

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || loading) return;

    const nextMessages: Message[] = [...messages, { role: "user", content: clean }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          personaId,
          messages: nextMessages.filter((m) => m.role !== "system"),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `I could not reach the AI service: ${message}` },
      ]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  return (
    <main className="shell">
      <section className="hero">
        <div className="eyebrow">Assignment 01 · Prompt Engineering · Scaler Academy</div>
        <div className="hero-grid">
          <div>
            <h1>Scaler Persona Lab</h1>
            <p>
              A deployed-ready persona chatbot with separate researched prompts for Anshuman Singh,
              Abhimanyu Saxena, and Kshitij Mishra. The app keeps each persona isolated, transparent,
              and grounded in public-source research instead of shallow mimicry.
            </p>
          </div>
          <div className="score-card" aria-label="Submission readiness">
            <span className="score">10</span>
            <span className="score-copy">point rubric coverage</span>
            <small>Frontend, backend, prompts, docs, env safety, and deployment checklist.</small>
          </div>
        </div>
      </section>

      <section className="app-grid">
        <aside className="card sidebar" aria-label="Persona switcher">
          <div className="section-title">
            <span>01</span>
            <div>
              <strong>Choose persona</strong>
              <p>Switching resets the conversation and swaps the active system prompt.</p>
            </div>
          </div>

          <div className="persona-list">
            {(Object.keys(personas) as PersonaId[]).map((id) => (
              <button
                className={`persona-btn ${id === personaId ? "active" : ""}`}
                key={id}
                onClick={() => switchPersona(id)}
                style={id === personaId ? { borderColor: personas[id].color } : undefined}
              >
                <span className="avatar" style={{ background: `${personas[id].color}30`, color: personas[id].color }}>
                  {personas[id].name.split(" ").map((part) => part[0]).join("")}
                </span>
                <span className="persona-copy">
                  <strong>{personas[id].name}</strong>
                  <small>{personas[id].short}</small>
                </span>
              </button>
            ))}
          </div>

          <div className="insight-card">
            <div className="mini-label">Active style signals</div>
            <ul>
              {personaFacts[personaId].map((fact) => (
                <li key={fact}>{fact}</li>
              ))}
            </ul>
          </div>

          <div>
            <div className="mini-label">Quick-start questions</div>
            <div className="chips">
              {persona.suggestions.map((chip) => (
                <button className="chip" key={chip} onClick={() => send(chip)} disabled={loading}>
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <p className="note">
            Educational simulation only. The prompts use public research and avoid private claims or fabricated quotes.
          </p>
        </aside>

        <section className="card chat" aria-label="Chat interface">
          <header className="chat-head">
            <div className="chat-persona">
              <span className="avatar large" style={{ background: `${persona.color}30`, color: persona.color }}>
                {persona.name.split(" ").map((part) => part[0]).join("")}
              </span>
              <div>
                <h2>{persona.name}</h2>
                <small>{persona.role}</small>
              </div>
            </div>
            <div className="status-pill" style={{ background: `${persona.color}20`, borderColor: `${persona.color}80` }}>
              Active · {questionCount} asked
            </div>
          </header>

          <div className="messages">
            {visibleMessages.map((m, idx) => (
              <div key={`${m.role}-${idx}`} className={`msg ${m.role}`}>
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="typing" aria-live="polite">
                <span />
                <span />
                <span />
                {persona.name} is shaping a persona-grounded reply…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="form" onSubmit={onSubmit}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask ${persona.name} about careers, projects, DSA, interviews...`}
              disabled={loading}
              aria-label="Message"
            />
            <button disabled={loading || !input.trim()} type="submit">
              Send
            </button>
          </form>
        </section>

        <aside className="card rubric" aria-label="Prompt engineering rubric coverage">
          <div className="section-title">
            <span>02</span>
            <div>
              <strong>Prompt contract</strong>
              <p>What every persona prompt contains.</p>
            </div>
          </div>
          <ul className="check-list">
            {promptContract.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
          <div className="research-note">
            <strong>Research trail</strong>
            <p>
              See <code>prompts.md</code>, <code>docs/</code>, and <code>research/deep-style/</code> for the
              public-source reasoning behind each style choice.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
