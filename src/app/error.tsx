"use client";

import Link from "next/link";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="glass-panel p-8">
        <h1 className="text-2xl font-bold text-ink-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-ink-600">
          An unexpected error occurred. You can try again, or return to the SamaritanLink home.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <button onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-secondary">Go home</Link>
        </div>
      </div>
    </main>
  );
}
