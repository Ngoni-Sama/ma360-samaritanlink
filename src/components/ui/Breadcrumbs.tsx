import Link from "next/link";
import { Icon } from "./Icon";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link href={c.href} className="font-medium text-ink-500 hover:text-brand-700">{c.label}</Link>
              ) : (
                <span className={last ? "font-semibold text-ink-800" : "text-ink-500"} aria-current={last ? "page" : undefined}>
                  {c.label}
                </span>
              )}
              {!last && <Icon name="ArrowRight" className="h-3.5 w-3.5 text-ink-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
