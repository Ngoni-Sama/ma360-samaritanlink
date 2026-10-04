"use client";

import { Icon } from "@/components/ui/Icon";
import { useWorkflowStatus, dismissWorkflowError } from "@/lib/store/workflow";

// Shows "Saving…" while a care action is in flight and a dismissible message when
// one fails. Sits above the mobile bottom navigation.
export function WorkflowToast() {
  const { pending, error } = useWorkflowStatus();
  if (!error && pending === 0) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(5.5rem+env(safe-area-inset-bottom,0px))] z-50 flex justify-center px-4 lg:bottom-6">
      {error ? (
        <div role="alert" className="pointer-events-auto flex max-w-md items-start gap-3 rounded-2xl border border-rose-200 bg-white px-4 py-3 shadow-glass-lg">
          <Icon name="AlertTriangle" className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <p className="text-sm text-ink-800">{error}</p>
          <button type="button" onClick={dismissWorkflowError} className="-my-1 -mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-500 hover:bg-ink-50" aria-label="Dismiss message">
            <Icon name="X" className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div role="status" className="pointer-events-auto flex items-center gap-2 rounded-full border border-ink-100 bg-white px-4 py-2 text-sm font-medium text-ink-700 shadow-glass">
          <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500 motion-reduce:animate-none" />
          Saving…
        </div>
      )}
    </div>
  );
}
