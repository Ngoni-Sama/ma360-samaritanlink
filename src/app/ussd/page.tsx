"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

type Mode = "ussd" | "sms";

export default function UssdSimulator() {
  const [mode, setMode] = useState<Mode>("ussd");
  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ma360-mark.png" alt="MA360" className="h-9 w-9 object-contain" />
          <div>
            <h1 className="text-xl font-bold text-ink-900">Multi-channel access</h1>
            <p className="text-sm text-ink-500">Works on any phone — no smartphone, no data required.</p>
          </div>
        </div>
        <Link href="/" className="btn-secondary text-sm">Back to site</Link>
      </div>

      <div className="mb-5 flex gap-2">
        {(["ussd", "sms"] as Mode[]).map((m) => (
          <button key={m} onClick={() => setMode(m)}
            className={`pill border ${mode === m ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 bg-white/70 text-ink-600"}`}>
            <Icon name={m === "ussd" ? "Phone" : "MessageSquareText"} className="h-3.5 w-3.5" />
            {m === "ussd" ? "USSD  *365#" : "SMS to 365"}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
        {mode === "ussd" ? <UssdPhone /> : <SmsPhone />}
        <Explainer mode={mode} />
      </div>
    </main>
  );
}

function Phone({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-[360px] rounded-[2rem] border border-ink-200 bg-ink-900 p-3 shadow-glass-lg">
      <div className="flex h-[520px] flex-col rounded-3xl bg-ink-950 p-3">
        <div className="mb-2 flex items-center justify-between px-2 text-[11px] text-white/60">
          <span>MA360 Mobile</span><span>◗ ◗ ◗</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function UssdPhone() {
  const [screen, setScreen] = useState<string>("Dial *365# to begin.");
  const [acc, setAcc] = useState<string>("");
  const [ended, setEnded] = useState(true);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send(text: string, newAcc: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/ussd", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const body = await r.text();
      const isEnd = body.startsWith("END");
      setScreen(body.replace(/^(CON|END)\s?/, ""));
      setEnded(isEnd);
      setAcc(isEnd ? "" : newAcc);
    } finally { setBusy(false); setInput(""); }
  }

  return (
    <Phone>
      <div className="flex-1 overflow-y-auto whitespace-pre-line rounded-2xl bg-emerald-50/95 p-3 font-mono text-[13px] leading-relaxed text-ink-900">
        {screen}
      </div>
      <div className="mt-3">
        {ended ? (
          <button onClick={() => send("", "")} disabled={busy} className="btn-primary w-full">
            <Icon name="Phone" className="h-4 w-4" /> Dial *365#
          </button>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); const na = acc ? `${acc}*${input}` : input; send(na, na); }} className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Reply…" autoFocus
              className="flex-1 rounded-full border border-white/20 bg-white/90 px-4 py-2.5 text-sm text-ink-900 outline-none" />
            <button disabled={busy || !input} className="btn-primary px-4 disabled:opacity-50"><Icon name="Send" className="h-4 w-4" /></button>
          </form>
        )}
      </div>
    </Phone>
  );
}

function SmsPhone() {
  const [log, setLog] = useState<{ me: boolean; text: string }[]>([
    { me: false, text: "MA360 SamaritanLink. Text HELP for options, or MEDS <your ID>. Dial *365# for the menu." },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text) return;
    setLog((l) => [...l, { me: true, text }]);
    setInput(""); setBusy(true);
    try {
      const r = await fetch("/api/sms", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ text }) });
      const { reply } = await r.json();
      setLog((l) => [...l, { me: false, text: reply }]);
    } finally { setBusy(false); }
  }

  return (
    <Phone>
      <div className="flex-1 space-y-2 overflow-y-auto rounded-2xl bg-white/95 p-3">
        {log.map((m, i) => (
          <div key={i} className={`max-w-[85%] rounded-2xl px-3 py-2 text-[13px] leading-snug ${m.me ? "ml-auto bg-brand-600 text-white" : "bg-ink-100 text-ink-800"} whitespace-pre-line`}>
            {m.text}
          </div>
        ))}
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(); }} className="mt-3 flex gap-2">
        <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. MEDS SL-P-2026-000001"
          className="flex-1 rounded-full border border-white/20 bg-white/90 px-4 py-2.5 text-sm text-ink-900 outline-none" />
        <button disabled={busy || !input} className="btn-primary px-4 disabled:opacity-50"><Icon name="Send" className="h-4 w-4" /></button>
      </form>
    </Phone>
  );
}

function Explainer({ mode }: { mode: Mode }) {
  return (
    <div className="space-y-4">
      <div className="glass-panel p-5">
        <h2 className="text-sm font-bold text-ink-900">Why this matters</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          Many patients have no smartphone or data. USSD and SMS let anyone reach SamaritanLink on the most basic
          phone — checking medicine status, appointments, and requesting screening or a health worker — reducing the
          digital-access barrier in the Health Access Equity layer.
        </p>
      </div>
      <div className="glass-panel p-5">
        <h2 className="text-sm font-bold text-ink-900">{mode === "ussd" ? "Try the USSD menu" : "Try SMS keywords"}</h2>
        {mode === "ussd" ? (
          <ol className="mt-2 space-y-1.5 text-sm text-ink-600">
            <li>1. Tap <span className="font-semibold">Dial *365#</span></li>
            <li>2. Reply <span className="font-mono font-semibold">2</span> (My medicines)</li>
            <li>3. Enter <span className="font-mono font-semibold">SL-P-2026-000001</span></li>
            <li>4. See live status pulled from the database</li>
          </ol>
        ) : (
          <ul className="mt-2 space-y-1.5 text-sm text-ink-600">
            <li><span className="font-mono font-semibold">MEDS SL-P-2026-000001</span> — medicine status</li>
            <li><span className="font-mono font-semibold">APPT SL-P-2026-000001</span> — next appointment</li>
            <li><span className="font-mono font-semibold">SCREEN</span> — request screening</li>
            <li><span className="font-mono font-semibold">HELP</span> — all keywords</li>
          </ul>
        )}
      </div>
      <div className="glass-panel p-5">
        <h2 className="text-sm font-bold text-ink-900">Production-ready</h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-600">
          These endpoints follow the standard telecom gateway protocol (Africa&apos;s Talking-compatible USSD CON/END and
          inbound SMS). Point a real aggregator or Econet / NetOne / Telecel short-code at{" "}
          <span className="font-mono">/api/ussd</span> and <span className="font-mono">/api/sms</span> to go live.
        </p>
      </div>
    </div>
  );
}
