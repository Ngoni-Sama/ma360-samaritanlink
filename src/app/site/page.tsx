"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

interface Item {
  id: string; category: string; label: string; detail: string | null; link: string | null;
  status: string; checked: boolean; notes: string | null; source: string | null; order: number;
}

const STATUS: Record<string, { label: string; cls: string }> = {
  done: { label: "Built", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  partial: { label: "Partial", cls: "bg-amber-50 text-amber-700 border-amber-200" },
  missing: { label: "Missing", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  todo: { label: "To do", cls: "bg-ink-50 text-ink-500 border-ink-200" },
};

export default function SiteChecklist() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unchecked" | "missing">("all");

  async function load() {
    const r = await fetch("/api/checklist", { cache: "no-store" });
    if (r.ok) setItems(await r.json());
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function post(body: object) {
    const r = await fetch("/api/checklist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (r.ok) load();
  }

  const groups = useMemo(() => {
    const filtered = items.filter((i) =>
      filter === "all" ? true : filter === "unchecked" ? !i.checked : i.status === "missing",
    );
    const map = new Map<string, Item[]>();
    for (const it of filtered) { if (!map.has(it.category)) map.set(it.category, []); map.get(it.category)!.push(it); }
    return Array.from(map.entries());
  }, [items, filter]);

  const total = items.length;
  const checked = items.filter((i) => i.checked).length;
  const pct = total ? Math.round((checked / total) * 100) : 0;

  return (
    <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ma360-mark.png" alt="MA360" className="h-8 w-8 object-contain" />
            <h1 className="text-xl font-bold text-ink-900">SamaritanLink — Build Verification</h1>
          </div>
          <p className="mt-1 text-sm text-ink-500">
            Internal QA checklist from the MA360 strategy, commercial & equity docs. Tick each item once verified.
            <span className="font-medium text-rose-600"> Remove this page (/site) before launch.</span>
          </p>
        </div>
        <Link href="/" className="btn-secondary text-sm">View site</Link>
      </div>

      {/* Progress */}
      <div className="glass-panel mb-5 p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-ink-900">{checked} / {total} verified</p>
          <p className="text-sm font-bold text-brand-700">{pct}%</p>
        </div>
        <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-ink-100">
          <div className="h-full rounded-full bg-brand-500 transition-all" style={{ width: `${pct}%` }} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {(["all", "unchecked", "missing"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`pill border ${filter === f ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 bg-white/70 text-ink-600"}`}>
              {f === "all" ? "All" : f === "unchecked" ? "Not yet verified" : "Missing / gaps"}
            </button>
          ))}
          <button onClick={() => post({ op: "reset" })} className="pill ml-auto border border-ink-200 bg-white/70 text-ink-500">
            <Icon name="Route" className="h-3.5 w-3.5" /> Reset checklist
          </button>
        </div>
      </div>

      {loading && <p className="text-sm text-ink-500">Loading…</p>}

      {groups.map(([category, list]) => (
        <section key={category} className="mb-5">
          <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-brand-700">{category}</h2>
          <div className="space-y-2">
            {list.map((it) => {
              const s = STATUS[it.status] ?? STATUS.todo;
              return (
                <div key={it.id} className="glass-panel p-4">
                  <div className="flex items-start gap-3">
                    <button onClick={() => post({ op: "toggle", id: it.id, checked: !it.checked })} className="mt-0.5 shrink-0" aria-label="Toggle verified">
                      <Icon name={it.checked ? "CheckCircle2" : "ClipboardList"} className={`h-6 w-6 ${it.checked ? "text-brand-600" : "text-ink-300"}`} />
                    </button>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className={`text-sm font-semibold ${it.checked ? "text-ink-400 line-through" : "text-ink-900"}`}>{it.label}</p>
                        <span className={`pill border ${s.cls}`}>{s.label}</span>
                        {it.source && <span className="text-[11px] text-ink-400">{it.source}</span>}
                      </div>
                      {it.detail && <p className="mt-0.5 text-xs text-ink-500">{it.detail}</p>}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        {it.link && (
                          <Link href={it.link} target="_blank" className="pill border border-brand-200 bg-brand-50 text-brand-700">
                            <Icon name="ExternalLink" className="h-3.5 w-3.5" /> Open page
                          </Link>
                        )}
                        <NoteEditor item={it} onSave={(notes) => post({ op: "notes", id: it.id, notes })} />
                        <button onClick={() => post({ op: "delete", id: it.id })} className="pill border border-ink-200 bg-white/70 text-ink-400 hover:text-rose-600">
                          <Icon name="X" className="h-3.5 w-3.5" /> Remove
                        </button>
                      </div>
                      {it.notes && <p className="mt-1.5 text-xs text-ink-600">Note: {it.notes}</p>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}

      <AddItem onAdd={(payload) => post({ op: "add", ...payload })} />
    </main>
  );
}

function NoteEditor({ item, onSave }: { item: Item; onSave: (notes: string) => void }) {
  const [open, setOpen] = useState(false);
  const [val, setVal] = useState(item.notes ?? "");
  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="pill border border-ink-200 bg-white/70 text-ink-500">
        <Icon name="MessageSquareText" className="h-3.5 w-3.5" /> {item.notes ? "Edit note" : "Add note / screenshot link"}
      </button>
    );
  }
  return (
    <span className="flex items-center gap-1.5">
      <input value={val} onChange={(e) => setVal(e.target.value)} placeholder="Screenshot URL or verification note"
        className="rounded-full border border-white/70 bg-white/80 px-3 py-1 text-xs text-ink-900 outline-none focus:border-brand-300" />
      <button onClick={() => { onSave(val); setOpen(false); }} className="pill border border-brand-500 bg-brand-600 text-white">Save</button>
    </span>
  );
}

function AddItem({ onAdd }: { onAdd: (p: { category: string; label: string }) => void }) {
  const [label, setLabel] = useState("");
  const [category, setCategory] = useState("Z. Custom");
  return (
    <div className="glass-panel p-4">
      <p className="mb-2 text-sm font-bold text-ink-900">Add a checklist item</p>
      <div className="flex flex-wrap gap-2">
        <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Category"
          className="w-40 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        <input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="What to verify"
          className="flex-1 rounded-2xl border border-white/70 bg-white/80 px-3 py-2 text-sm outline-none focus:border-brand-300" />
        <button disabled={!label.trim()} onClick={() => { onAdd({ category, label: label.trim() }); setLabel(""); }} className="btn-primary disabled:opacity-50">
          <Icon name="ArrowRight" className="h-4 w-4" /> Add
        </button>
      </div>
    </div>
  );
}
