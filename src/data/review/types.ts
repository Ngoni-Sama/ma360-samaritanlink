// Shape of a recorded end-to-end test run, as imported for the /review page.
export interface ReviewStep {
  n: number;
  title: string;
  ok: boolean;
  error: string | null;
  ms: number;
  url: string;
  shot: string | null;
}

export interface ReviewStage {
  num: number;
  name: string;
  viewport: string;
  video: string | null;
  duration: number; // seconds
  startsAt: number; // seconds into the full-run video
  consoleErrors: string[];
  fatal: string | null;
  steps: ReviewStep[];
}

export interface ReviewRun {
  id: string;
  base: string;
  startedAt: string;
  finishedAt: string;
  fullVideo: string | null;
  stages: ReviewStage[];
}
