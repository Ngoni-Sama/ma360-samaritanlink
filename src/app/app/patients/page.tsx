"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { PATIENTS, nextPatientId } from "@/lib/data/connected";

export default function PatientsPage() {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return PATIENTS;
    return PATIENTS.filter(
      (p) =>
        p.patientId.toLowerCase().includes(s) ||
        p.name.toLowerCase().includes(s) ||
        (p.nationalId?.toLowerCase().includes(s) ?? false),
    );
  }, [q]);

  return (
    <>
      <PageHeader
        title="Patient search"
        subtitle="Find a patient by their SamaritanLink ID, name or national ID."
        action={
          <span className="pill border border-brand-200 bg-brand-50 font-mono text-brand-800">
            <Icon name="IdCard" className="h-3.5 w-3.5" /> Next ID: {nextPatientId()}
          </span>
        }
      />

      <GlassCard className="mb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 py-2.5">
          <Icon name="Search" className="h-5 w-5 text-ink-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. SL-P-2026-000001, Tendai Moyo, or 63-1234567-A-42"
            className="w-full bg-transparent text-sm text-ink-900 outline-none"
            autoFocus
          />
          {q && (
            <button onClick={() => setQ("")} className="text-ink-400 hover:text-ink-700" aria-label="Clear">
              <Icon name="X" className="h-4 w-4" />
            </button>
          )}
        </div>
      </GlassCard>

      <div className="space-y-2.5">
        {results.map((p) => (
          <Link
            key={p.patientId}
            href={`/app/patients/${p.patientId}`}
            className="glass-panel flex flex-wrap items-center gap-4 px-4 py-3.5 transition hover:-translate-y-0.5 hover:shadow-glass-lg"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
              <Icon name="UserRound" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink-900">{p.name}</p>
              <p className="text-xs text-ink-500">{p.age} · {p.sex} · {p.location}</p>
            </div>
            <span className="pill border border-brand-200 bg-brand-50 font-mono text-brand-800">{p.patientId}</span>
            {p.alerts.some((a) => a.toLowerCase().includes("urgent")) && (
              <span className="pill border border-rose-200 bg-rose-50 text-rose-700">
                <Icon name="AlertTriangle" className="h-3.5 w-3.5" /> Urgent
              </span>
            )}
            <Icon name="ArrowRight" className="h-4 w-4 text-brand-400" />
          </Link>
        ))}
        {results.length === 0 && (
          <GlassCard className="text-center text-sm text-ink-500">
            No patient found for “{q}”. Check the SamaritanLink ID and try again.
          </GlassCard>
        )}
      </div>
    </>
  );
}
