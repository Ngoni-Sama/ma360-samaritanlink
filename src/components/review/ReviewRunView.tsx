"use client";

// Viewer for one recorded end-to-end test run: the full recording with stage
// chapters, each stage's own recording, and a screenshot per step in a lightbox.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import type { ReviewRun, ReviewStage, ReviewStep } from "@/data/review/types";

export interface RunSummary { id: string; href: string; passed: number; total: number; startedAt: string }

interface Shot { stage: ReviewStage; step: ReviewStep }

const TZ = "Africa/Harare";
const when = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: TZ }).format(new Date(iso));
const day = (iso: string) => new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: TZ }).format(new Date(iso));
const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const isPhone = (s: ReviewStage) => Number(s.viewport.split("x")[0]) < 768;

export function ReviewRunView({ run, runs }: { run: ReviewRun; runs: RunSummary[] }) {
  const [onlyFailed, setOnlyFailed] = useState(false);
  const [open, setOpen] = useState<number | null>(null);
  const fullRef = useRef<HTMLVideoElement>(null);

  const all: Shot[] = useMemo(() => run.stages.flatMap((stage) => stage.steps.map((step) => ({ stage, step }))), [run]);
  const failed = all.filter((s) => !s.step.ok);
  const shown = onlyFailed ? failed : all;
  const passed = all.length - failed.length;
  const recorded = run.stages.reduce((sum, s) => sum + s.duration, 0);
  const pct = all.length ? Math.round((passed / all.length) * 100) : 0;

  const openShot = (shot: Shot) => setOpen(shown.findIndex((s) => s.step === shot.step));
  const openFailed = (shot: Shot) => { setOnlyFailed(true); setOpen(failed.findIndex((s) => s.step === shot.step)); };

  function playChapter(stage: ReviewStage) {
    const v = fullRef.current;
    if (!v) return;
    v.currentTime = stage.startsAt + 0.05;
    v.play().catch(() => {});
  }

  return (
    <>
      {runs.length > 1 && (
        <nav aria-label="Test runs" className="mb-5 flex flex-wrap gap-2">
          {runs.map((r) => {
            const active = r.id === run.id;
            const clean = r.passed === r.total;
            return (
              <Link key={r.id} href={r.href} aria-current={active ? "page" : undefined}
                className={`pill min-h-9 border ${active ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 bg-white/70 text-ink-600 hover:border-brand-300"}`}>
                <Icon name={clean ? "CheckCircle2" : "AlertTriangle"} className={`h-3.5 w-3.5 ${active ? "text-white" : clean ? "text-emerald-600" : "text-rose-600"}`} />
                {day(r.startedAt)} · {r.passed}/{r.total}
              </Link>
            );
          })}
        </nav>
      )}

      {/* Summary */}
      <section aria-labelledby="summary-h" className="glass-panel mb-5 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 id="summary-h" className="text-lg font-bold text-ink-900">
              {failed.length === 0 ? `All ${all.length} steps passed` : `${passed} of ${all.length} steps passed, ${failed.length} failed`}
            </h2>
            <p className="mt-1 text-sm text-ink-500">
              Run on {when(run.startedAt)} against{" "}
              <a href={run.base} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-700 underline-offset-2 hover:underline">
                {run.base.replace(/^https?:\/\//, "")}
              </a>{" "}
              in a real Chromium browser. Demo data was reset before and after.
            </p>
          </div>
          <span className={`pill border ${failed.length ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            <Icon name={failed.length ? "XCircle" : "CheckCircle2"} className="h-3.5 w-3.5" /> {pct}% passed
          </span>
        </div>
        <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-rose-100" aria-hidden>
          <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Steps passed", String(passed)],
            ["Failed", String(failed.length)],
            ["Stages", String(run.stages.length)],
            ["Recorded", clock(recorded)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl border border-white/70 bg-white/60 px-4 py-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-ink-500">{k}</dt>
              <dd className={`mt-0.5 text-2xl font-bold tabular-nums ${k === "Failed" && failed.length ? "text-rose-700" : "text-ink-900"}`}>{v}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* What failed */}
      {failed.length > 0 && (
        <section aria-labelledby="failed-h" className="mb-5 rounded-3xl border border-rose-200 bg-rose-50/80 p-5">
          <h2 id="failed-h" className="flex items-center gap-2 text-base font-bold text-rose-800">
            <Icon name="AlertTriangle" className="h-4 w-4" /> What failed
          </h2>
          <ul className="mt-3 space-y-3">
            {failed.map((f) => (
              <li key={`${f.stage.num}.${f.step.n}`} className="rounded-2xl border border-rose-200 bg-white/80 p-4">
                <p className="text-sm font-semibold text-ink-900">
                  <span className="mr-1.5 font-mono text-xs text-ink-500">{f.stage.num}.{f.step.n}</span>
                  {f.stage.name}: {f.step.title}
                </p>
                {f.step.error && <p className="mt-1 text-sm text-rose-800">{f.step.error}</p>}
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => openFailed(f)} className="pill min-h-9 border border-rose-200 bg-white text-rose-700 hover:bg-rose-50">
                    <Icon name="Images" className="h-3.5 w-3.5" /> View screenshot
                  </button>
                  <a href={`#stage-${f.stage.num}`} className="pill min-h-9 border border-ink-200 bg-white text-ink-600 hover:border-brand-300">
                    <Icon name="Video" className="h-3.5 w-3.5" /> Go to the stage recording
                  </a>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Full recording with chapters */}
      {run.fullVideo && (
        <section aria-labelledby="full-h" className="glass-panel mb-5 p-5 sm:p-6">
          <h2 id="full-h" className="flex items-center gap-2 text-base font-bold text-ink-900">
            <Icon name="PlayCircle" className="h-4 w-4 text-brand-700" /> Full recording
          </h2>
          <p className="mt-1 text-sm text-ink-500">All stages back to back. The caption in the corner names the stage, the step and whether it passed. Pick a stage to jump to it.</p>
          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <video ref={fullRef} src={run.fullVideo} controls playsInline preload="metadata"
              poster={run.stages[0]?.steps[0]?.shot ?? undefined}
              className="aspect-[16/10] w-full rounded-2xl border border-ink-100 bg-ink-900 object-contain" />
            <ol className="grid content-start gap-1 sm:grid-cols-2 lg:grid-cols-1" aria-label="Chapters">
              {run.stages.map((s) => {
                const bad = s.steps.some((t) => !t.ok);
                return (
                  <li key={s.num}>
                    <button type="button" onClick={() => playChapter(s)}
                      className="flex min-h-10 w-full items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-sm text-ink-700 hover:bg-white/80">
                      <span className="w-5 shrink-0 text-right font-mono text-xs text-ink-400">{s.num}</span>
                      <span className="min-w-0 flex-1 truncate">{s.name}</span>
                      {bad && <Icon name="AlertTriangle" className="h-3.5 w-3.5 shrink-0 text-rose-600" />}
                      <span className="shrink-0 font-mono text-xs tabular-nums text-ink-400">{clock(s.startsAt)}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* Filter */}
      <div className="sticky top-[env(safe-area-inset-top,0px)] z-20 -mx-1 mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white/80 px-1 py-2 backdrop-blur" role="group" aria-label="Show steps">
        {[false, true].map((f) => (
          <button key={String(f)} type="button" aria-pressed={onlyFailed === f} onClick={() => setOnlyFailed(f)} disabled={f && failed.length === 0}
            className={`pill min-h-9 border disabled:opacity-40 ${onlyFailed === f ? "border-brand-500 bg-brand-600 text-white" : "border-ink-200 bg-white/70 text-ink-600"}`}>
            {f ? `Failed only (${failed.length})` : `All steps (${all.length})`}
          </button>
        ))}
        <nav aria-label="Stages" className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
          {run.stages.filter((s) => !onlyFailed || s.steps.some((t) => !t.ok)).map((s) => (
            <a key={s.num} href={`#stage-${s.num}`} title={s.name}
              className={`pill min-h-9 shrink-0 border ${s.steps.every((t) => t.ok) ? "border-ink-200 bg-white/70 text-ink-600" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
              {s.num}
            </a>
          ))}
        </nav>
      </div>

      {/* Stages */}
      <div className="space-y-5">
        {run.stages.map((stage) => {
          const steps = onlyFailed ? stage.steps.filter((t) => !t.ok) : stage.steps;
          if (steps.length === 0) return null;
          const ok = stage.steps.filter((t) => t.ok).length;
          const phone = isPhone(stage);
          return (
            <section key={stage.num} id={`stage-${stage.num}`} aria-labelledby={`stage-${stage.num}-h`} className="glass-panel scroll-mt-20 p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-brand-600 text-sm font-bold text-white">{stage.num}</span>
                <h2 id={`stage-${stage.num}-h`} className="min-w-0 flex-1 text-lg font-bold text-ink-900">{stage.name}</h2>
                <span className={`pill border ${ok === stage.steps.length ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-rose-200 bg-rose-50 text-rose-700"}`}>
                  {ok}/{stage.steps.length} passed
                </span>
                <span className="pill border border-ink-200 bg-white/70 text-ink-500">
                  <Icon name={phone ? "Smartphone" : "Monitor"} className="h-3.5 w-3.5" /> {stage.viewport.replace("x", " × ")}
                </span>
                {stage.duration > 0 && (
                  <span className="pill border border-ink-200 bg-white/70 text-ink-500"><Icon name="Clock" className="h-3.5 w-3.5" /> {clock(stage.duration)}</span>
                )}
              </div>
              {stage.fatal && <p className="mt-3 text-sm text-rose-700">Stage stopped early: {stage.fatal}</p>}

              <div className={`mt-4 grid gap-5 ${phone ? "md:grid-cols-[15rem_minmax(0,1fr)]" : ""}`}>
                {stage.video && (
                  <video src={stage.video} controls playsInline preload="none" poster={stage.steps[0]?.shot ?? undefined}
                    aria-label={`Recording of stage ${stage.num}: ${stage.name}`}
                    className={`w-full rounded-2xl border border-ink-100 bg-ink-900 object-contain ${phone ? "mx-auto aspect-[390/844] max-h-[32rem] max-w-[15rem]" : "aspect-[16/10]"}`} />
                )}
                <ol className={`grid min-w-0 content-start gap-3 sm:grid-cols-2 ${phone ? "" : "lg:grid-cols-3"}`}>
                  {steps.map((step) => (
                    <li key={step.n} className="min-w-0">
                      <StepCard stage={stage} step={step} onOpen={() => openShot({ stage, step })} />
                    </li>
                  ))}
                </ol>
              </div>

              {stage.consoleErrors.length > 0 && (
                <details className="mt-4 text-sm">
                  <summary className="cursor-pointer font-semibold text-rose-700">{stage.consoleErrors.length} browser console error(s)</summary>
                  <ul className="mt-2 space-y-1">{stage.consoleErrors.map((e, i) => <li key={i} className="break-words font-mono text-xs text-ink-600">{e}</li>)}</ul>
                </details>
              )}
            </section>
          );
        })}
      </div>

      {open !== null && shown[open] && (
        <Lightbox shots={shown} index={open} onIndex={setOpen} onClose={() => setOpen(null)} />
      )}
    </>
  );
}

function StepCard({ stage, step, onOpen }: { stage: ReviewStage; step: ReviewStep; onOpen: () => void }) {
  return (
    <button type="button" onClick={onOpen}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white/80 text-left transition hover:shadow-glass ${step.ok ? "border-white/70" : "border-rose-300"}`}>
      <span className="relative block aspect-[16/10] w-full overflow-hidden bg-ink-100">
        {step.shot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={step.shot} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover object-top transition group-hover:scale-[1.02]" />
        )}
        <span className={`absolute left-2 top-2 rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${step.ok ? "bg-emerald-600 text-white" : "bg-rose-600 text-white"}`}>
          {step.ok ? "Pass" : "Fail"}
        </span>
      </span>
      <span className="flex flex-1 flex-col gap-1 p-3">
        <span className="text-sm font-semibold text-ink-900">
          <span className="mr-1.5 font-mono text-xs font-normal text-ink-400">{stage.num}.{step.n}</span>{step.title}
        </span>
        {!step.ok && step.error && <span className="text-xs text-rose-700">{step.error}</span>}
        <span className="mt-auto flex flex-wrap gap-x-3 gap-y-0.5 pt-1 text-xs text-ink-500">
          <span className="min-w-0 truncate font-mono">{step.url}</span>
          <span className="tabular-nums">{(step.ms / 1000).toFixed(1)} s</span>
        </span>
      </span>
    </button>
  );
}

function Lightbox({ shots, index, onIndex, onClose }: { shots: Shot[]; index: number; onIndex: (i: number) => void; onClose: () => void }) {
  const { stage, step } = shots[index];
  const closeRef = useRef<HTMLButtonElement>(null);
  const go = useCallback((d: number) => onIndex((index + d + shots.length) % shots.length), [index, onIndex, shots.length]);

  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = overflow; before?.focus?.(); };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") go(1);
      else if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, onClose]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Screenshot ${stage.num}.${step.n}: ${step.title}`}
      className="fixed inset-0 z-50 flex flex-col bg-ink-900/95 pb-[env(safe-area-inset-bottom,0px)] pt-[env(safe-area-inset-top,0px)]"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="flex items-center gap-3 px-4 py-3 text-white">
        <span className="font-mono text-xs tabular-nums text-white/60">{index + 1} of {shots.length}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-white/80">Stage {stage.num} · {stage.name}</span>
        <button ref={closeRef} type="button" onClick={onClose} aria-label="Close screenshot"
          className="grid h-11 w-11 place-items-center rounded-full bg-white/10 hover:bg-white/20">
          <Icon name="X" className="h-5 w-5" />
        </button>
      </div>
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 sm:px-16" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        {step.shot && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={step.shot} alt={`Screen after step ${stage.num}.${step.n}: ${step.title}`} className="max-h-full max-w-full rounded-xl object-contain shadow-2xl" />
        )}
        <button type="button" onClick={() => go(-1)} aria-label="Previous screenshot"
          className="absolute left-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid">
          <Icon name="ChevronLeft" className="h-6 w-6" />
        </button>
        <button type="button" onClick={() => go(1)} aria-label="Next screenshot"
          className="absolute right-2 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 sm:grid">
          <Icon name="ChevronRight" className="h-6 w-6" />
        </button>
      </div>
      <div className="mx-auto w-full max-w-3xl px-4 py-4 text-white">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold">
          <span className={`rounded-md px-1.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${step.ok ? "bg-emerald-600" : "bg-rose-600"}`}>{step.ok ? "Pass" : "Fail"}</span>
          <span className="font-mono text-xs font-normal text-white/60">{stage.num}.{step.n}</span>
          <span className="min-w-0">{step.title}</span>
        </p>
        {!step.ok && step.error && <p className="mt-1 text-sm text-rose-200">{step.error}</p>}
        <p className="mt-1 flex flex-wrap gap-x-4 text-xs text-white/60">
          <span className="font-mono">{step.url}</span><span className="tabular-nums">{(step.ms / 1000).toFixed(1)} s</span>
        </p>
        <div className="mt-3 flex gap-2 sm:hidden">
          <button type="button" onClick={() => go(-1)} className="btn flex-1 bg-white/10 text-white hover:bg-white/20"><Icon name="ChevronLeft" className="h-4 w-4" /> Previous</button>
          <button type="button" onClick={() => go(1)} className="btn flex-1 bg-white/10 text-white hover:bg-white/20">Next <Icon name="ChevronRight" className="h-4 w-4" /></button>
        </div>
      </div>
    </div>
  );
}
