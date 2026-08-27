import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useRef, useState } from "react";
import { Loader2, Send, Volume2, Square } from "lucide-react";
import { askAssistant } from "@/lib/ai.functions";
import { AI_DISCLAIMER } from "@/lib/ai-prompts";
import { getPlan, useApp } from "@/lib/app-state";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({
    meta: [
      { title: "Outbound AI Fitness Assistant — Outbound Fitness" },
      {
        name: "description",
        content:
          "Ask the Outbound AI Fitness Assistant about exercises, equipment, memberships, facilities, accessibility and fitness goals.",
      },
      { property: "og:title", content: "Outbound AI Fitness Assistant" },
      {
        property: "og:description",
        content: "An accessible AI fitness assistant with clear, screen-reader friendly answers.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Assistant,
});

const SUGGESTIONS = [
  "How do I use the seated chest press safely?",
  "What is included in the Premium membership?",
  "Give me a 15 minute beginner workout at home.",
  "How does the gym support blind members?",
];

interface Msg {
  role: "user" | "assistant";
  content: string;
}

function Assistant() {
  const { user, preferences, speak, announce } = useApp();
  const ask = useServerFn(askAssistant);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "Hello, I am the Outbound AI Fitness Assistant. Ask me about exercises, equipment, memberships, our facilities, accessibility or your fitness goals. I can also build you a simple beginner-friendly workout.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const logRef = useRef<HTMLDivElement>(null);

  const visuallyImpaired =
    user?.category === "visually-impaired" || preferences.audioInstructions;

  const send = async (text: string) => {
    const question = text.trim();
    if (!question || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: question }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError("");
    announce("Question sent. Waiting for a reply.");
    try {
      const plan = user ? getPlan(user.category, user.plan) : null;
      const result = await ask({
        data: {
          messages: next.slice(-12).map((m) => ({ role: m.role, content: m.content })),
          visuallyImpaired,
          ...(user?.name ? { name: user.name } : {}),
          ...(plan ? { plan: plan.name } : {}),
          ...(user?.goals?.length ? { goals: user.goals } : {}),
        },
      });
      if (result.error) {
        setError(result.error);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: result.reply }]);
        announce("The assistant has replied.");
        speak(result.reply);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
      window.setTimeout(() => logRef.current?.scrollTo({ top: 999999 }), 50);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
        Outbound AI Fitness Assistant
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Answers about exercises, equipment, memberships, facilities, accessibility and fitness
        goals.
      </p>
      <p className="mt-4 rounded-xl border-2 border-gold bg-card p-4 text-foreground">
        <strong>AI-generated content.</strong> {AI_DISCLAIMER} The assistant does not diagnose
        medical conditions. Please speak to a doctor or qualified fitness professional about health
        concerns, pain or injury.
      </p>

      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation with the AI Fitness Assistant"
        className="mt-6 max-h-[28rem] space-y-4 overflow-y-auto rounded-2xl border-2 border-border bg-card p-5"
      >
        {messages.map((m, i) => (
          <article
            key={i}
            className={
              m.role === "user"
                ? "rounded-xl border-2 border-primary bg-surface p-4"
                : "rounded-xl border-2 border-border bg-background p-4"
            }
          >
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">
              {m.role === "user" ? "You" : "AI Assistant (AI-generated)"}
            </h2>
            <p className="mt-1 whitespace-pre-wrap text-lg text-foreground">{m.content}</p>
            {m.role === "assistant" && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    window.speechSynthesis?.cancel();
                    const u = new SpeechSynthesisUtterance(m.content);
                    u.rate = 0.95;
                    window.speechSynthesis?.speak(u);
                  }}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-border px-3 font-semibold text-foreground hover:bg-accent"
                >
                  <Volume2 className="size-4" aria-hidden="true" />
                  Read aloud
                </button>
                <button
                  type="button"
                  onClick={() => window.speechSynthesis?.cancel()}
                  className="inline-flex min-h-11 items-center gap-2 rounded-lg border-2 border-border px-3 font-semibold text-foreground hover:bg-accent"
                >
                  <Square className="size-4" aria-hidden="true" />
                  Stop
                </button>
              </div>
            )}
          </article>
        ))}
        {loading && (
          <p className="flex items-center gap-2 text-lg text-muted-foreground">
            <Loader2 className="size-5 animate-spin" aria-hidden="true" />
            The assistant is thinking…
          </p>
        )}
      </div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border-2 border-destructive bg-card p-4 font-semibold text-destructive">
          Error: {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-5 rounded-2xl border-2 border-border bg-card p-5"
      >
        <label htmlFor="question" className="block text-lg font-semibold text-foreground">
          Your question
        </label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <input
            id="question"
            value={input}
            maxLength={2000}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about exercises, equipment or memberships"
            className="h-13 flex-1 rounded-xl border-2 border-input bg-background px-4 text-lg text-foreground"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-lg font-semibold text-primary-foreground hover:opacity-90 disabled:opacity-60"
          >
            <Send className="size-5" aria-hidden="true" />
            Send
          </button>
        </div>
      </form>

      <h2 className="mt-8 text-xl font-bold text-foreground">Example questions</h2>
      <ul className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <li key={s}>
            <button
              type="button"
              onClick={() => void send(s)}
              className="min-h-11 rounded-lg border-2 border-border bg-card px-4 py-2 text-left font-medium text-foreground hover:bg-accent"
            >
              {s}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
