"use client";

import { useRef, useState, useEffect } from "react";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";

interface ChatMessage {
  role: "user" | "assistant";
  text: string;
}

const EXAMPLES = [
  "I have been having headaches and dizziness.",
  "Help me find a clinic near me.",
  "My blood pressure medicine is finishing.",
];

const GREETING =
  "Hello, I'm the SamaritanLink Health Navigation Assistant. Tell me what's going on and I'll help you find the right next step. I give general guidance only — not a diagnosis.";

export default function NavigatorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([{ role: "assistant", text: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function send(text: string) {
    const msg = text.trim();
    if (!msg || loading) return;

    // Memory: send the last 3 prior USER prompts as history.
    const priorUserPrompts = messages.filter((m) => m.role === "user").map((m) => m.text).slice(-3);

    setMessages((m) => [...m, { role: "user", text: msg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/navigator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history: priorUserPrompts }),
      });
      const data = await res.json();
      setMessages((m) => [
        ...m,
        { role: "assistant", text: data.reply || "Sorry, I couldn't respond just now. Please try again." },
      ]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", text: "I'm having trouble connecting right now. Please try again in a moment." },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <PageHeader title="Health Navigator" subtitle="Ask anything — guidance toward the right next step, not a diagnosis." />

      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Icon name="Shield" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">AI Health Navigation Assistant.</span> General information and navigation only.
          It does not diagnose, prescribe, or replace a doctor or nurse. In an emergency, seek immediate care.
        </p>
      </div>

      <GlassCard className="flex h-[60vh] min-h-[420px] flex-col p-0">
        {/* Messages */}
        <div className="flex-1 space-y-3 overflow-y-auto p-4 sm:p-5">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              {m.role === "assistant" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                  <Icon name="MessageSquareText" className="h-4 w-4" />
                </span>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  m.role === "user"
                    ? "bg-brand-600 text-white"
                    : "border border-white/60 bg-white/70 text-ink-800"
                }`}
              >
                {m.text}
              </div>
              {m.role === "user" && (
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-600">
                  <Icon name="UserRound" className="h-4 w-4" />
                </span>
              )}
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                <Icon name="MessageSquareText" className="h-4 w-4" />
              </span>
              <div className="rounded-2xl border border-white/60 bg-white/70 px-4 py-3">
                <span className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.3s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400 [animation-delay:-0.15s]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-brand-400" />
                </span>
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Example chips (only before the first user message) */}
        {messages.filter((m) => m.role === "user").length === 0 && (
          <div className="flex flex-wrap gap-2 px-4 pb-2 sm:px-5">
            {EXAMPLES.map((ex) => (
              <button key={ex} onClick={() => send(ex)} className="pill border border-ink-200 bg-white/70 text-ink-600 hover:bg-white">
                {ex}
              </button>
            ))}
          </div>
        )}

        {/* Composer */}
        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex items-end gap-2 border-t border-white/60 p-3 sm:p-4"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
            }}
            rows={1}
            placeholder="Describe your health need…"
            className="max-h-32 min-h-[44px] flex-1 resize-none rounded-2xl border border-white/70 bg-white/80 px-4 py-3 text-sm text-ink-900 outline-none backdrop-blur focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
          />
          <button type="submit" disabled={loading || !input.trim()} className="btn-primary h-11 px-4 disabled:opacity-50">
            <Icon name="Send" className="h-4 w-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </GlassCard>
    </>
  );
}
