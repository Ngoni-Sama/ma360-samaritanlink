import type { ReactNode } from "react";
import type { CareStatus } from "@/lib/data/types";
import { Icon } from "./Icon";

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`glass-panel p-5 sm:p-6 ${className}`}>{children}</div>;
}

export function SectionTitle({
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl font-bold text-ink-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base leading-relaxed text-ink-600">{subtitle}</p>}
    </div>
  );
}

const STATUS_MAP: Record<CareStatus, { label: string; cls: string; icon: string }> = {
  within_range: {
    label: "Within expected range",
    cls: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    icon: "CheckCircle2",
  },
  requires_followup: {
    label: "Requires follow-up",
    cls: "bg-amber-50 text-amber-700 border border-amber-200",
    icon: "Bell",
  },
  requires_urgent_attention: {
    label: "Requires urgent clinical attention",
    cls: "bg-rose-50 text-rose-700 border border-rose-200",
    icon: "AlertTriangle",
  },
};

export function StatusPill({ status }: { status: CareStatus }) {
  const s = STATUS_MAP[status];
  return (
    <span className={`pill ${s.cls}`}>
      <Icon name={s.icon} className="h-3.5 w-3.5" />
      {s.label}
    </span>
  );
}

export function Tag({
  children,
  tone = "brand",
}: {
  children: ReactNode;
  tone?: "brand" | "neutral" | "green" | "amber" | "rose";
}) {
  const tones = {
    brand: "bg-brand-50 text-brand-700 border border-brand-200",
    neutral: "bg-ink-50 text-ink-600 border border-ink-200",
    green: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    amber: "bg-amber-50 text-amber-700 border border-amber-200",
    rose: "bg-rose-50 text-rose-700 border border-rose-200",
  } as const;
  return <span className={`pill ${tones[tone]}`}>{children}</span>;
}

export function DemoBadge() {
  return (
    <span className="pill border border-ink-200 bg-white/70 text-ink-500">
      <Icon name="ShieldCheck" className="h-3.5 w-3.5" />
      Demo data
    </span>
  );
}
