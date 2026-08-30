"use client";

import { Icon } from "@/components/ui/Icon";
import { workflow } from "@/lib/store/workflow";

// Convenience for the demo: reset all interactive workflow state to the seed.
export function WorkflowReset() {
  return (
    <button
      onClick={() => workflow.reset()}
      className="btn-ghost text-xs text-ink-500"
      title="Reset the interactive demo workflows to their starting state"
    >
      <Icon name="Route" className="h-3.5 w-3.5" /> Reset demo workflows
    </button>
  );
}
