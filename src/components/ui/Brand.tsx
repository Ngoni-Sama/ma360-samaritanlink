// MA360 brand lockup using the real SamaritanLink mark (transparent PNG),
// with a crisp HTML wordmark so text stays sharp at any size and on any
// background. The heart-journey mark renders correctly on both light and dark.
export function Brand({
  variant = "full",
  onDark = false,
}: {
  variant?: "full" | "compact";
  onDark?: boolean;
}) {
  return (
    <span className="flex items-center gap-2.5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/ma360-mark.png" alt="MA360 SamaritanLink" className="h-9 w-9 object-contain" />
      <span className="leading-tight">
        <span className={`block text-sm font-extrabold tracking-tight ${onDark ? "text-white" : "text-ink-900"}`}>
          MA360
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
