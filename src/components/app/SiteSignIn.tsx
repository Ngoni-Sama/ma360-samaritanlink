"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";

// Convenience for the /site QA page: sign in as any demo role so the /app/* links
// in the checklist actually open (instead of bouncing to /login). Same-origin
// cookie is shared across tabs, so links that open in new tabs work afterwards.
const ROLES = [
  { label: "Patient", email: "patient@demo.samaritanlink" },
  { label: "CHW", email: "chw@demo.samaritanlink" },
  { label: "Clinician", email: "clinician@demo.samaritanlink" },
  { label: "Pharmacy", email: "pharmacy@demo.samaritanlink" },
  { label: "Laboratory", email: "lab@demo.samaritanlink" },
  { label: "Administrator", email: "admin@demo.samaritanlink" },
];

export function SiteSignIn() {
  const [active, setActive] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function signIn(email: string, label: string) {
    setBusy(true);
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: "demo1234" }),
      });
      if (r.ok) setActive(label);
    } finally { setBusy(false); }
  }

  return (
    <div className="glass-panel mb-5 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 text-sm font-semibold text-ink-900">
          <Icon name="ShieldCheck" className="h-4 w-4 text-brand-600" /> Demo sign-in
        </span>
        <span className="text-xs text-ink-500">Sign in so the app-page links below open (they require a role).</span>
        {active && <span className="pill ml-auto border border-emerald-200 bg-emerald-50 text-emerald-700"><Icon name="CheckCircle2" className="h-3.5 w-3.5" /> Signed in as {active}</span>}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {ROLES.map((r) => (
          <button type="button" key={r.email} aria-pressed={active === r.label} disabled={busy} onClick={() => signIn(r.email, r.label)}
            className={`pill border disabled:opacity-50 ${active === r.label ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 bg-white/70 text-ink-700 hover:bg-white"}`}>
            {r.label}
          </button>
        ))}
        <form action="/api/auth/logout" method="post" className="ml-auto">
          <button className="pill border border-ink-200 bg-white/70 text-ink-500" type="submit"><Icon name="LogOut" className="h-3.5 w-3.5" /> Sign out</button>
        </form>
      </div>
    </div>
  );
}
