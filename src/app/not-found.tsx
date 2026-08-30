import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col items-center justify-center px-4 text-center">
      <div className="glass-panel p-8">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">404</p>
        <h1 className="mt-2 text-2xl font-bold text-ink-900">Page not found</h1>
        <p className="mt-2 text-sm text-ink-600">
          The page you are looking for doesn’t exist or has moved.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-primary">Go home</Link>
          <Link href="/app" className="btn-secondary">Open SamaritanLink</Link>
        </div>
      </div>
    </main>
  );
}
