"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/app/PageHeader";

export interface PatientRow {
  patientId: string;
  name: string;
  age: number;
  sex: string;
  location: string;
  nationalId: string | null;
  urgent: boolean;
}

export function PatientSearchClient({ patients, nextId }: { patients: PatientRow[]; nextId: string }) {
  const [q, setQ] = useState("");
  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return patients;
    return patients.filter(
      (p) =>
        p.patientId.toLowerCase().includes(s) ||
        p.name.toLowerCase().includes(s) ||
        (p.nationalId?.toLowerCase().includes(s) ?? false),
    );
  }, [q, patients]);

  return (
    <>
      <PageHeader
        title="Patient search"
        subtitle="Find a patient by their SamaritanLink ID, name or national ID."
        action={
          <span className="pill border border-brand-200 bg-brand-50 font-mono text-brand-800">
            <Icon name="IdCard" className="h-3.5 w-3.5" /> Next ID: {nextId}
          </span>
        }
      />

      <GlassCard className="mb-4">
        <div className="flex items-center gap-2 rounded-2xl border border-white/70 bg-white/80 pl-4 pr-1 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-200">
          <Icon name="Search" className="h-5 w-5 shrink-0 text-ink-400" />
          <input
            type="search"
            aria-label="Search patients by SamaritanLink ID, name or national ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="e.g. SL-P-2026-000001, Tendai Moyo, or 63-1234567-A-42"
            className="min-h-11 w-full bg-transparent text-sm text-ink-900 outline-none"
            autoFocus
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50 hover:text-ink-800" aria-label="Clear search">
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
            {p.urgent && (
              <span className="pill border border-rose-200 bg-rose-50 text-rose-700">
                <Icon name="AlertTriangle" className="h-3.5 w-3.5" /> Urgent
              </span>
            )}
            <Icon name="ArrowRight" className="h-4 w-4 text-brand-400" />
          </Link>
        ))}
        {results.length === 0 && (
          <EmptyState
            icon="Search"
            title={`No patient matches “${q}”`}
            hint="Check the ID format (SL-P-2026-000001), or search by name or national ID instead."
            action={{ label: "Clear search", onClick: () => setQ("") }}
          />
        )}
      </div>
    </>
  );
}
