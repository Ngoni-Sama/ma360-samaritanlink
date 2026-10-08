import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { RUNS } from "@/data/review";
import type { ReviewRun } from "@/data/review/types";
import { ReviewRunView, type RunSummary } from "./ReviewRunView";

// Internal QA page (like /site): recorded end-to-end test runs. Remove before launch.
export function ReviewPage({ run }: { run: ReviewRun }) {
  const runs: RunSummary[] = RUNS.map((r, i) => {
    const steps = r.stages.flatMap((s) => s.steps);
    return { id: r.id, href: i === 0 ? "/review" : `/review/${r.id}`, passed: steps.filter((t) => t.ok).length, total: steps.length, startedAt: r.startedAt };
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Build checklist", href: "/site" }, { label: "Test recordings" }]} />
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ma360-mark.png" alt="MA360" className="h-8 w-8 object-contain" />
            <h1 className="text-xl font-bold text-ink-900">SamaritanLink — Test recordings</h1>
          </div>
          <p className="mt-1 max-w-2xl text-sm text-ink-500">
            Every role&apos;s journey, run step by step in a browser against the live site, with a recording of each stage and a screenshot after each step.
            <span className="font-medium text-rose-600"> Remove this page (/review) before launch.</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/site" className="btn-secondary text-sm">Build checklist</Link>
          <Link href="/" className="btn-secondary text-sm">View site</Link>
        </div>
      </div>
      <ReviewRunView run={run} runs={runs} />
    </main>
  );
}
