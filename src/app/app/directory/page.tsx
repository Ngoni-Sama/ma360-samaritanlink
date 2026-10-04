"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { SERVICE_CATEGORIES, DIRECTORY_PROVIDERS, CARE_PATHWAYS } from "@/lib/data/directory";

export default function DirectoryPage() {
  const [cat, setCat] = useState<string>("all");
  const [q, setQ] = useState("");

  const providers = useMemo(() => {
    const s = q.trim().toLowerCase();
    return DIRECTORY_PROVIDERS.filter(
      (p) =>
        (cat === "all" || p.category === cat) &&
        (!s || p.name.toLowerCase().includes(s) || p.specialty.toLowerCase().includes(s) || p.location.toLowerCase().includes(s) || p.id.toLowerCase().includes(s)),
    );
  }, [cat, q]);

  return (
    <>
      <PageHeader title="Healthcare Services Directory" subtitle="Find the right service, provider, specialty or location across the connected network." />

      {/* Care pathways */}
      <h2 className="mb-3 text-sm font-bold text-ink-900">Care pathways</h2>
      <div className="mb-6 grid gap-3 lg:grid-cols-3">
        {CARE_PATHWAYS.map((p) => (
          <GlassCard key={p.key}>
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name={p.icon} className="h-4.5 w-4.5" />
              </span>
              <h3 className="text-sm font-bold text-ink-900">{p.name}</h3>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {p.steps.map((s, i) => (
                <span key={s} className="flex items-center gap-1.5">
                  <span className="pill border border-brand-100 bg-brand-50 text-brand-800">{s}</span>
                  {i < p.steps.length - 1 && <Icon name="ArrowRight" className="h-3 w-3 text-brand-300" />}
                </span>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Search + category filter */}
      <GlassCard className="mb-4">
        <div className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/80 px-4 focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-200">
          <Icon name="Search" className="h-5 w-5 shrink-0 text-ink-400" />
          <input
            type="search"
            aria-label="Search providers by name, specialty, location or provider ID"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, specialty, location or provider ID"
            className="min-h-11 w-full bg-transparent text-sm text-ink-900 outline-none"
          />
        </div>
        <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          <button type="button" onClick={() => setCat("all")} aria-pressed={cat === "all"} className={chip(cat === "all")}>All</button>
          {SERVICE_CATEGORIES.map((c) => (
            <button type="button" key={c.key} onClick={() => setCat(c.key)} aria-pressed={cat === c.key} className={chip(cat === c.key)}>
              <Icon name={c.icon} className="h-3.5 w-3.5" /> {c.label}
            </button>
          ))}
        </div>
      </GlassCard>

      {/* Providers */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {providers.map((p) => (
          <GlassCard key={p.id}>
            <div className="flex items-start justify-between">
              <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                <Icon name={SERVICE_CATEGORIES.find((c) => c.key === p.category)?.icon ?? "Stethoscope"} className="h-5 w-5" />
              </span>
              <Tag tone={p.available ? "green" : "neutral"}>{p.available ? "Available" : "By appointment"}</Tag>
            </div>
            <h3 className="mt-3 text-sm font-bold text-ink-900">{p.name}</h3>
            <p className="text-sm text-ink-600">{p.specialty}</p>
            <p className="mt-1 text-xs text-ink-500">{p.facility} · {p.location}</p>
            <p className="mt-2 font-mono text-xs text-brand-700">{p.id}</p>
          </GlassCard>
        ))}
        {providers.length === 0 && (
          <div className="sm:col-span-2 lg:col-span-3">
            <EmptyState
              icon="Search"
              title="No providers match these filters"
              hint="Try a different spelling, a broader category, or search by town instead."
              action={{ label: "Clear search and filters", onClick: () => { setQ(""); setCat("all"); } }}
            />
          </div>
        )}
      </div>
    </>
  );
}

function chip(active: boolean) {
  return `pill min-h-10 border px-3.5 text-sm ${active ? "border-brand-600 bg-brand-600 text-white" : "border-ink-200 bg-white/70 text-ink-700 hover:bg-white"}`;
}
