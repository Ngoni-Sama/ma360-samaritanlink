import Link from "next/link";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { PATIENTS } from "@/lib/data/connected";
import { Icon } from "@/components/ui/Icon";
import { GlassCard, Tag } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { CareJourney } from "@/components/app/CareJourney";

// Role-based visibility of profile sections (see brief §3 "important principle").
function visibility(role: string) {
  switch (role) {
    case "pharmacy":
      return { summary: true, journey: true, clinical: false, meds: true, labs: false, docs: false };
    case "laboratory":
      return { summary: true, journey: true, clinical: false, meds: false, labs: true, docs: true };
    case "health_worker":
      return { summary: true, journey: true, clinical: true, meds: true, labs: false, docs: false };
    case "admin":
      return { summary: true, journey: true, clinical: false, meds: false, labs: false, docs: false };
    default: // professional / nurse
      return { summary: true, journey: true, clinical: true, meds: true, labs: true, docs: true };
  }
}

const FLAG_TONE: Record<string, "green" | "amber" | "rose"> = {
  normal: "green", borderline: "amber", high: "rose", low: "amber",
};

export default function PatientProfile({ params }: { params: { id: string } }) {
  const user = getCurrentUser();
  if (!user) return null;
  const patient = PATIENTS.find((p) => p.patientId.toLowerCase() === decodeURIComponent(params.id).toLowerCase());
  if (!patient) notFound();

  const v = visibility(user.role);

  return (
    <>
      <div className="mb-2">
        <Link href="/app/patients" className="text-sm font-medium text-ink-500 hover:text-brand-700">← Patient search</Link>
      </div>
      <PageHeader
        title={patient.name}
        subtitle={`${patient.age} · ${patient.sex} · ${patient.location}`}
        action={
          <span className="pill border border-brand-200 bg-brand-50 font-mono text-brand-800">
            <Icon name="BadgeCheck" className="h-3.5 w-3.5" /> {patient.patientId}
          </span>
        }
      />

      {patient.alerts.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {patient.alerts.map((a) => (
            <span key={a} className="pill border border-rose-200 bg-rose-50 text-rose-700">
              <Icon name="AlertTriangle" className="h-3.5 w-3.5" /> {a}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
        <div className="space-y-4">
          {/* Patient summary */}
          {v.summary && (
            <GlassCard>
              <h2 className="text-sm font-bold text-ink-900">Patient summary</h2>
              <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
                <Field label="SamaritanLink ID" value={patient.patientId} mono />
                <Field label="National ID" value={patient.nationalId ?? "—"} mono />
                <Field label="Contact" value={patient.contact} />
                <Field label="Emergency" value={patient.emergencyContact} />
                <Field label="Allergies" value={patient.allergies.join(", ") || "None recorded"} />
                <Field label="Location" value={patient.location} />
              </dl>
            </GlassCard>
          )}

          {v.clinical && (
            <GlassCard>
              <h2 className="text-sm font-bold text-ink-900">Clinical history</h2>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-ink-400">Conditions</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {patient.conditions.map((c) => <Tag key={c} tone="neutral">{c}</Tag>)}
              </div>
            </GlassCard>
          )}

          {v.meds && (
            <GlassCard>
              <h2 className="text-sm font-bold text-ink-900">Medication</h2>
              <div className="mt-3 space-y-2">
                {patient.medications.map((m) => (
                  <div key={m.name} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
                    <Icon name="Pill" className="h-4.5 w-4.5 text-brand-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">{m.name} <span className="font-normal text-ink-500">· {m.dosage}, {m.frequency}</span></p>
                      {m.pharmacy && <p className="text-xs text-ink-400">{m.pharmacy}</p>}
                    </div>
                    <Tag tone={m.status === "collected" || m.status === "active" ? "green" : m.status === "ready" ? "amber" : "neutral"}>{m.status}</Tag>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {v.labs && (
            <GlassCard>
              <h2 className="text-sm font-bold text-ink-900">Laboratory results</h2>
              <div className="mt-3 space-y-2">
                {patient.labResults.map((l) => (
                  <div key={l.test} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
                    <Icon name="FlaskConical" className="h-4.5 w-4.5 text-brand-600" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-ink-900">{l.test}</p>
                      <p className="text-xs text-ink-400">{l.date}</p>
                    </div>
                    <span className="text-sm font-semibold text-ink-800">{l.value}</span>
                    <Tag tone={FLAG_TONE[l.flag]}>{l.flag}</Tag>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}

          {v.docs && patient.documents.length > 0 && (
            <GlassCard>
              <h2 className="text-sm font-bold text-ink-900">Documents</h2>
              <div className="mt-3 space-y-2">
                {patient.documents.map((d) => (
                  <div key={d.name} className="flex items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-2.5">
                    <Icon name="ClipboardList" className="h-4.5 w-4.5 text-brand-600" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-ink-900">{d.name}</p>
                      <p className="text-xs text-ink-400">{d.kind}</p>
                    </div>
                    <span className="text-xs text-ink-400">{d.date}</span>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>

        {/* My Care Journey — signature feature */}
        {v.journey && (
          <GlassCard>
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-ink-900">My Care Journey</h2>
              <Icon name="Route" className="h-5 w-5 text-brand-600" />
            </div>
            <p className="mb-4 mt-1 text-xs text-ink-500">One connected history across every provider.</p>
            <CareJourney events={patient.journey} simple={user.role === "admin"} />
          </GlassCard>
        )}
      </div>
    </>
  );
}

function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-medium text-ink-400">{label}</dt>
      <dd className={`text-sm text-ink-800 ${mono ? "font-mono" : ""}`}>{value}</dd>
    </div>
  );
}
