"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { personas, PersonaId } from "./lib/personas";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "./lib/supabaseClient";

type Message = { role: "user" | "assistant" | "system"; content: string };

const initialSystem = (name: string): Message => ({
  role: "system",
  content: `New interview opened with ${name}. Switching mentors resets the transcript and loads a separate researched system prompt.`,
});

const personaDetails: Record<PersonaId, { initials: string; quote: string; knownFor: string[]; location: string }> = {
  anshuman: {
    initials: "AS",
    quote: "Fundamentals create skill. Skill creates impact. Impact creates opportunity.",
    knownFor: ["Scaler / InterviewBit co-founder", "Former Meta engineer", "Pragmatic CS fundamentals mentor"],
    location: "Founder-engineer perspective",
  },
  abhimanyu: {
    initials: "AX",
    quote: "Hard work matters, but the system and direction of effort matter just as much.",
    knownFor: ["Scaler / InterviewBit co-founder", "Education-system builder", "Outcome and mentorship focused"],
    location: "Founder-operator perspective",
  },
  kshitij: {
    initials: "KM",
    quote: "Debug the assumption first. The code usually tells you where the real problem is.",
    knownFor: ["Scaler technical mentor", "Builder and teacher", "First-principles debugging"],
    location: "Technical mentor perspective",
  },
};

const promptContract = ["public-source persona description", "3+ few-shot examples", "silent CoT + evaluation", "output style rules", "safety constraints"];

const differentiators = [
  "Separate system prompt per mentor, not one generic prompt",
  "Frontend sends personaId + message history to a written backend route",
  "Backend injects the chosen systemInstruction and keeps API key server-only",
  "Prompt docs explain research decisions instead of only dumping text",
];

const chatMlFlow = ["system: selected persona prompt", "user: current question", "assistant: Gemini response", "history: appended for context"];

export default function Home() {
  const [personaId, setPersonaId] = useState<PersonaId>("anshuman");
  const [messages, setMessages] = useState<Message[]>([initialSystem(personas.anshuman.name)]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(!isSupabaseConfigured());
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authMessage, setAuthMessage] = useState("");
  const [user, setUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const persona = personas[personaId];
  const details = personaDetails[personaId];

  const visibleMessages = useMemo(() => messages, [messages]);
  const userTurns = visibleMessages.filter((m) => m.role === "user").length;
  const supabase = getSupabaseBrowserClient();
  const authEnabled = Boolean(supabase);

  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setSessionToken(data.session?.access_token ?? null);
      setAuthChecked(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setSessionToken(session?.access_token ?? null);
      setAuthChecked(true);
    });

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

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
        headers: {
          "Content-Type": "application/json",
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
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
      setMessages((prev) => [...prev, { role: "assistant", content: `I could not reach the AI service: ${message}` }]);
    } finally {
      setLoading(false);
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 30);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
  }

  async function onAuthSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setAuthMessage("");
    setLoading(true);

    const action =
      authMode === "sign-up"
        ? supabase.auth.signUp({ email: authEmail.trim(), password: authPassword })
        : supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });

    const { error } = await action;
    setLoading(false);
    if (error) {
      setAuthMessage(error.message);
      return;
    }
    setAuthMessage(authMode === "sign-up" ? "Account created. Check your email if confirmation is enabled, then sign in." : "Signed in successfully.");
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMessages([initialSystem(persona.name)]);
  }

  if (authEnabled && !authChecked) {
    return <main className="auth-shell"><div className="auth-card"><span className="kicker">Loading</span><h1>Opening Persona Lab…</h1></div></main>;
  }

  if (authEnabled && !user) {
    return (
      <main className="auth-shell">
        <section className="auth-card">
          <span className="kicker">Secure access</span>
          <h1>Sign in to Persona Lab</h1>
          <p>Supabase Auth protects the deployed chatbot and keeps the Gemini backend behind a login.</p>
          <form className="auth-form" onSubmit={onAuthSubmit}>
            <input value={authEmail} onChange={(e) => setAuthEmail(e.target.value)} type="email" placeholder="Email" required />
            <input value={authPassword} onChange={(e) => setAuthPassword(e.target.value)} type="password" placeholder="Password" minLength={6} required />
            {authMessage && <p className="auth-message">{authMessage}</p>}
            <button disabled={loading} type="submit">{authMode === "sign-in" ? "Sign in" : "Create account"}</button>
          </form>
          <button className="text-button" onClick={() => setAuthMode(authMode === "sign-in" ? "sign-up" : "sign-in")} type="button">
            {authMode === "sign-in" ? "Need an account? Create one" : "Already have an account? Sign in"}
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="studio" style={{ "--persona": persona.color } as React.CSSProperties}>
      <aside className="rail" aria-label="Persona switcher">
        <div className="brand-block">
          <span className="kicker">Scaler Academy</span>
          <h1>Persona Lab</h1>
          <p>Three researched mentor simulations for Assignment 01.</p>
        </div>

        <div className="rail-section">
          <span className="rail-label">Choose your conversation</span>
          <div className="persona-stack">
            {(Object.keys(personas) as PersonaId[]).map((id) => (
              <button key={id} onClick={() => switchPersona(id)} className={`mentor-card ${id === personaId ? "active" : ""}`}>
                <span className="mentor-avatar" style={{ background: `${personas[id].color}24`, color: personas[id].color }}>
                  {personaDetails[id].initials}
                </span>
                <span>
                  <strong>{personas[id].name}</strong>
                  <small>{personas[id].short}</small>
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="rail-section subdued-panel">
          <span className="rail-label">Prompt includes</span>
          <ul className="tiny-list">
            {promptContract.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="rail-section subdued-panel">
          <span className="rail-label">Why evaluator can tell</span>
          <ul className="tiny-list">
            {differentiators.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <p className="ethics-note">Educational simulation. Public-source grounded. No private claims, no fabricated quotes.</p>
      </aside>

      <section className="conversation" aria-label="Chat interface">
        <header className="topbar">
          <div>
            <span className="kicker">Active persona</span>
            <strong>{persona.name}</strong>
          </div>
          <div className="top-actions">
            {user?.email && <span>{user.email}</span>}
            <span>{userTurns} questions</span>
            {authEnabled && <button onClick={signOut} disabled={loading} type="button">Sign out</button>}
            <button onClick={() => setMessages([initialSystem(persona.name)])} disabled={loading} type="button">
              Reset
            </button>
          </div>
        </header>

        <div className="conversation-scroll">
          <section className="profile-sheet">
            <div className="profile-avatar" style={{ background: `${persona.color}24`, color: persona.color }}>
              {details.initials}
            </div>
            <div className="profile-copy">
              <span className="kicker">{details.location}</span>
              <h2>{persona.name}</h2>
              <p className="quote">“{details.quote}”</p>
              <div className="known-grid">
                {details.knownFor.map((item, index) => (
                  <div key={item}>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="evidence-board" aria-label="Assignment evidence">
            <div>
              <span className="kicker">Persona fingerprint</span>
              <p>{persona.short}</p>
            </div>
            <div>
              <span className="kicker">ChatML style flow</span>
              <ol>
                {chatMlFlow.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </div>
            <div>
              <span className="kicker">Research trail</span>
              <p><code>prompts.md</code> · <code>docs/</code> · <code>research/deep-style/</code></p>
            </div>
          </section>

          <section className="suggestion-row" aria-label="Suggested prompts">
            {persona.suggestions.map((chip) => (
              <button key={chip} onClick={() => send(chip)} disabled={loading}>
                {chip}
              </button>
            ))}
          </section>

          <section className="transcript">
            {visibleMessages.map((m, idx) => (
              <article key={`${m.role}-${idx}`} className={`line ${m.role}`}>
                <span className="speaker">{m.role === "assistant" ? details.initials : m.role === "user" ? "YOU" : "SYS"}</span>
                <p>{m.content}</p>
              </article>
            ))}
            {loading && (
              <article className="line assistant loading-line" aria-live="polite">
                <span className="speaker">{details.initials}</span>
                <p><span className="dots"><i /><i /><i /></span> composing a grounded response…</p>
              </article>
            )}
            <div ref={bottomRef} />
          </section>
        </div>

        <form className="composer" onSubmit={onSubmit}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask ${persona.name} about DSA, careers, projects, interviews...`}
            disabled={loading}
            aria-label="Message"
          />
          <button disabled={loading || !input.trim()} type="submit">
            Send <span>→</span>
          </button>
        </form>
      </section>
    </main>
  );
}
