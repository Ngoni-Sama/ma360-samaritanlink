import { notFound } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { GlassCard } from "@/components/ui/primitives";
import { PageHeader } from "@/components/app/PageHeader";
import { CareJourney } from "@/components/app/CareJourney";
import { db } from "@/lib/db";
import type { JourneyEvent } from "@/lib/data/connected";

// The patient-facing "My Care Journey". Demo patient = Tendai Moyo.
export default async function MyJourneyPage() {
  const patient = await db.patient.findUnique({
    where: { patientId: "SL-P-2026-000001" },
    include: { journey: true },
  });
  if (!patient) notFound();
  const journey = patient.journey as unknown as JourneyEvent[];
  const next = journey.find((e) => e.status === "scheduled" || e.status === "active");

  return (
    <>
      <PageHeader
        title="My Care Journey"
        subtitle="Where you are, what has happened, and what happens next."
        action={
          <span className="pill border border-brand-200 bg-brand-50 font-mono text-brand-800">
            <Icon name="IdCard" className="h-3.5 w-3.5" /> {patient.patientId}
          </span>
        }
      />

      {next && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl border border-brand-200 bg-brand-50 px-4 py-3">
          <Icon name="CalendarClock" className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
          <p className="text-sm text-brand-800">
            <span className="font-semibold">Next: {next.title}</span> — {next.detail} ({next.date}).
          </p>
        </div>
      )}

      <GlassCard>
        <CareJourney events={journey} simple />
      </GlassCard>
    </>
  );
}
