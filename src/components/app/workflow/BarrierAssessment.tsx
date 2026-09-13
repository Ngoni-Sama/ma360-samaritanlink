"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";

// Patient Access Barrier Assessment (equity addendum §3). Integrated into Health
// Navigation: not only "where does the patient need to go?" but "what might
// prevent them from getting there or completing care?" — then a response.
const BARRIERS: { key: string; label: string; question: string; response: string; icon: string }[] = [
  { key: "transport", label: "Transport", question: "Can the patient afford transport?", response: "Arrange community transport support or a home visit.", icon: "Truck" },
  { key: "work", label: "Work / caregiving", question: "Can they leave work or caregiving?", response: "Offer a flexible appointment time or home follow-up.", icon: "Users" },
  { key: "distance", label: "Distance", question: "Is distance a barrier?", response: "Route to the nearest participating facility or home-based care.", icon: "MapPin" },
  { key: "mobility", label: "Mobility", question: "Is mobility a problem?", response: "Schedule a home visit with assisted transport.", icon: "Activity" },
  { key: "medication", label: "Medication", question: "Can they afford medication?", response: "Apply affordability support; nearest pharmacy or delivery.", icon: "Pill" },
  { key: "privacy", label: "Privacy", question: "Is privacy preventing care?", response: "Use a confidential channel and discreet follow-up.", icon: "Shield" },
  { key: "home", label: "Home follow-up", question: "Does the patient need home follow-up?", response: "Schedule a community health worker home visit.", icon: "Home" },
  { key: "special", label: "Special circumstances", question: "Pregnancy/postnatal or disability access issues?", response: "Enrol in the priority home follow-up pathway.", icon: "HeartHandshake" },
];

export function BarrierAssessment() {
  const [sel, setSel] = useState<Record<string, boolean>>({});
  const chosen = BARRIERS.filter((b) => sel[b.key]);

  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Icon name="ClipboardCheck" className="h-5 w-5 text-brand-600" />
        <h2 className="text-sm font-bold text-ink-900">Patient Access Barrier Assessment</h2>
      </div>
      <p className="mt-1 text-xs text-ink-500">
        Beyond “where does this patient need to go?” — what might prevent them getting there or completing care?
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {["Identify the barrier", "Select the response", "Reconnect the patient", "Monitor continuity"].map((s, i) => (
          <span key={s} className="flex items-center gap-2">
            <span className="pill border border-brand-200 bg-brand-50 text-brand-800">{s}</span>
            {i < 3 && <Icon name="ArrowRight" className="h-3 w-3 text-brand-300" />}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {BARRIERS.map((b) => (
          <button
            key={b.key}
            onClick={() => setSel((s) => ({ ...s, [b.key]: !s[b.key] }))}
            className={`flex items-start gap-2.5 rounded-2xl border px-3 py-2.5 text-left transition ${sel[b.key] ? "border-brand-500 bg-brand-50" : "border-white/60 bg-white/60 hover:bg-white"}`}
          >
            <Icon name={sel[b.key] ? "CheckCircle2" : b.icon} className={`mt-0.5 h-4.5 w-4.5 shrink-0 ${sel[b.key] ? "text-brand-600" : "text-ink-400"}`} />
            <span>
              <span className="block text-sm font-semibold text-ink-900">{b.label}</span>
              <span className="block text-xs text-ink-500">{b.question}</span>
            </span>
          </button>
        ))}
      </div>

      {chosen.length > 0 && (
        <div className="mt-4 rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">Recommended responses — reconnect the patient</p>
          <ul className="mt-2 space-y-1.5">
            {chosen.map((b) => (
              <li key={b.key} className="flex gap-2 text-sm text-brand-900">
                <Icon name="ArrowRight" className="mt-0.5 h-4 w-4 shrink-0 text-brand-500" />
                <span><span className="font-medium">{b.label}:</span> {b.response}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </GlassCard>
  );
}
