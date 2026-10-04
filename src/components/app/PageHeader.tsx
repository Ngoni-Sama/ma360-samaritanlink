import { DemoBadge } from "@/components/ui/primitives";

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="text-2xl font-bold leading-tight text-ink-900 text-balance sm:text-[1.75rem]">{title}</h1>
          <DemoBadge />
        </div>
        {subtitle && <p className="mt-1.5 max-w-prose text-base leading-relaxed text-ink-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
