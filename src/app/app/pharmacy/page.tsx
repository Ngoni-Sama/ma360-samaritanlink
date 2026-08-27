import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { PATIENT_PRESCRIPTIONS, PHARMACY_CARDS } from "@/lib/data/demo";

const AVAIL: Record<string, { label: string; tone: "green" | "amber" | "rose" }> = {
  available: { label: "Available", tone: "green" },
  limited: { label: "Limited stock", tone: "amber" },
  out_of_stock: { label: "Out of stock", tone: "rose" },
};

export default function PharmacyPage() {
  return (
    <>
      <PageHeader title="Pharmacy Connect" subtitle="Find and reserve medicines at participating pharmacies. Mock inventory." />

      <GlassCard className="mb-4">
        <h2 className="text-sm font-bold text-ink-900">My prescription</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-ink-400">
                <th className="pb-2 font-medium">Medicine</th>
                <th className="pb-2 font-medium">Dosage</th>
                <th className="pb-2 font-medium">Duration</th>
                <th className="pb-2 font-medium">Prescriber</th>
                <th className="pb-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {PATIENT_PRESCRIPTIONS.map((rx) => (
                <tr key={rx.id} className="border-t border-white/60">
                  <td className="py-2.5 font-semibold text-ink-900">{rx.medicine}</td>
                  <td className="py-2.5 text-ink-600">{rx.dosage}</td>
                  <td className="py-2.5 text-ink-600">{rx.duration}</td>
                  <td className="py-2.5 text-ink-600">{rx.prescriber}</td>
                  <td className="py-2.5">
                    <Tag tone={rx.status === "ready" ? "green" : "neutral"}>{rx.status}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <h2 className="mb-3 text-sm font-bold text-ink-900">Find medicine</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PHARMACY_CARDS.map((ph) => {
          const a = AVAIL[ph.availability];
          return (
            <GlassCard key={ph.id}>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
                    <Icon name="Pill" className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-ink-900">{ph.name}</p>
                    <p className="text-xs text-ink-500">{ph.location} · {ph.distanceKm} km</p>
                  </div>
                </div>
                <Tag tone={a.tone}>{a.label}</Tag>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  className="btn-primary flex-1 py-2 text-xs disabled:opacity-50"
                  disabled={ph.availability === "out_of_stock"}
                >
                  Reserve
                </button>
                <button className="btn-secondary flex-1 py-2 text-xs">Request assistance</button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </>
  );
}
