"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import type { NavigatorReply } from "@/lib/data/demo";

const EXAMPLES = [
  "I have been having headaches and dizziness.",
  "I need help finding a clinic near me.",
  "My blood pressure medicine is finishing.",
];

export default function NavigatorPage() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState<NavigatorReply | null>(null);
  const [loading, setLoading] = useState(false);

  async function ask(text: string) {
    if (!text.trim()) return;
    setLoading(true);
    setReply(null);
    const res = await fetch("/api/navigator", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    const data = await res.json();
    setReply(data.reply);
    setLoading(false);
  }

  return (
    <>
      <PageHeader
        title="Health Navigator"
        subtitle="Guidance toward the right next step — not a diagnosis."
      />

      <div className="mb-4 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3">
        <Icon name="Shield" className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <p className="text-sm text-amber-800">
          <span className="font-semibold">AI Health Navigation Assistant.</span> This assistant provides
          general information and navigation only. It does not diagnose, prescribe, or replace a doctor or nurse.
          In an emergency, seek immediate care.
        </p>
      </div>

      <GlassCard>
        <label className="mb-2 block text-sm font-medium text-ink-700">Describe your health need</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={3}
          placeholder="For example: I have been having headaches and dizziness."
          className="w-full resize-none rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink-900 outline-none backdrop-blur focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
        />
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button onClick={() => ask(message)} disabled={loading} className="btn-primary disabled:opacity-60">
            {loading ? "Thinking…" : "Get guidance"}
            <Icon name="Send" className="h-4 w-4" />
          </button>
          {EXAMPLES.map((ex) => (
            <button
              key={ex}
              onClick={() => { setMessage(ex); ask(ex); }}
              className="pill border border-ink-200 bg-white/70 text-ink-600 hover:bg-white"
            >
              {ex}
            </button>
          ))}
        </div>
      </GlassCard>

      {reply && (
        <GlassCard className="mt-4 animate-fade-up">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
              <Icon name="MessageSquareText" className="h-4.5 w-4.5" />
            </span>
            <h2 className="text-sm font-bold text-ink-900">{reply.summary}</h2>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">General information</p>
              <ul className="mt-2 space-y-1.5">
                {reply.information.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-ink-700">
                    <Icon name="CheckCircle2" className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Warning signs — seek care</p>
              <ul className="mt-2 space-y-1.5">
                {reply.warningSigns.map((t) => (
                  <li key={t} className="flex gap-2 text-sm text-ink-700">
                    <Icon name="AlertTriangle" className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
            <p className="text-sm font-medium text-brand-800">{reply.recommendation}</p>
          </div>

          <Link href={reply.suggestedStep.href} className="btn-primary mt-4">
            {reply.suggestedStep.label}
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </GlassCard>
      )}
    </>
  );
}
