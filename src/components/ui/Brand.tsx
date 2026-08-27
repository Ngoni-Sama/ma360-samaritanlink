import { Icon } from "./Icon";

// MA360 brand lockup, aligned to medaccess360.com: a teal medical-cross badge
// with the "MedAccess360" wordmark, plus the SamaritanLink sub-brand line.
export function Brand({
  variant = "full",
  onDark = false,
}: {
  variant?: "full" | "compact";
  onDark?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
        <Icon name="Cross" className="h-5 w-5" strokeWidth={2.2} />
      </span>
      <span className="leading-tight">
        <span className={`block text-sm font-extrabold tracking-tight ${onDark ? "text-white" : "text-ink-900"}`}>
          Med<span className="text-brand-600">Access</span>360
        </span>
        {variant === "full" ? (
          <span className={`block text-[11px] font-semibold ${onDark ? "text-brand-100" : "text-brand-700"}`}>
            SamaritanLink
          </span>
        ) : (
          <span className={`block text-[10px] font-semibold uppercase tracking-[0.18em] ${onDark ? "text-brand-100/80" : "text-ink-400"}`}>
            Foundation
          </span>
        )}
      </span>
    </span>
  );
}
