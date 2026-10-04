import Link from "next/link";
import { Icon } from "./Icon";

export interface EmptyAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

// Empty state: icon, a headline that says what will appear here, a hint, and one
// next step. Used for first use, cleared lists and no-results.
export function EmptyState({ icon, title, hint, action }: { icon: string; title: string; hint?: string; action?: EmptyAction }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-ink-200 bg-white/40 px-4 py-6 text-center">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600/10 text-brand-700">
        <Icon name={icon} className="h-5 w-5" />
      </span>
      <p className="mt-3 text-sm font-semibold text-ink-900">{title}</p>
      {hint && <p className="mt-1 max-w-sm text-sm text-ink-500">{hint}</p>}
      {action &&
        (action.href ? (
          <Link href={action.href} className="btn-secondary mt-4">{action.label}</Link>
        ) : (
          <button type="button" onClick={action.onClick} className="btn-secondary mt-4">{action.label}</button>
        ))}
    </div>
  );
}

// Placeholder rows while the first load is in flight.
export function LoadingRows({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-2.5" role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-16 animate-pulse rounded-2xl bg-ink-100/70 motion-reduce:animate-none" />
      ))}
    </div>
  );
}
