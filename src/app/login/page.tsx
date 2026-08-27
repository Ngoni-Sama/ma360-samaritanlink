"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";

const DEMO_ACCOUNTS = [
  { role: "Patient", email: "patient@demo.samaritanlink", icon: "UserRound" },
  { role: "Community Health Worker", email: "chw@demo.samaritanlink", icon: "Users" },
  { role: "Healthcare Professional", email: "clinician@demo.samaritanlink", icon: "Stethoscope" },
  { role: "Pharmacy", email: "pharmacy@demo.samaritanlink", icon: "Pill" },
  { role: "Administrator", email: "admin@demo.samaritanlink", icon: "Shield" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("patient@demo.samaritanlink");
  const [password, setPassword] = useState("demo1234");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      router.push("/app");
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed.");
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col items-center justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center gap-2.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white">
          <Icon name="HeartHandshake" className="h-5 w-5" />
        </span>
        <span className="text-lg font-bold text-ink-900">MA360 SamaritanLink</span>
      </Link>

      <div className="grid w-full gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Login form */}
        <div className="glass-panel p-6 sm:p-8">
          <h1 className="text-2xl font-bold text-ink-900">Access SamaritanLink</h1>
          <p className="mt-1.5 text-sm text-ink-600">Sign in to your role-based dashboard.</p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink-900 outline-none backdrop-blur focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-ink-700">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/70 bg-white/70 px-4 py-3 text-sm text-ink-900 outline-none backdrop-blur focus:border-brand-300 focus:ring-2 focus:ring-brand-200"
                required
              />
            </div>
            {error && (
              <p className="flex items-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm text-rose-700">
                <Icon name="AlertTriangle" className="h-4 w-4" />
                {error}
              </p>
            )}
            <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-60">
              {loading ? "Signing in…" : "Sign In"}
              <Icon name="ArrowRight" className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Demo accounts */}
        <div className="glass-panel p-6 sm:p-8">
          <div className="flex items-center gap-2">
            <Icon name="ShieldCheck" className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-bold text-ink-900">Demo accounts</h2>
          </div>
          <p className="mt-1.5 text-sm text-ink-600">
            Prototype access. Every account uses the password <span className="font-semibold text-ink-800">demo1234</span>.
          </p>
          <div className="mt-4 space-y-2">
            {DEMO_ACCOUNTS.map((a) => (
              <button
                key={a.email}
                onClick={() => { setEmail(a.email); setPassword("demo1234"); setError(""); }}
                className="flex w-full items-center gap-3 rounded-2xl border border-white/60 bg-white/60 px-4 py-3 text-left transition hover:bg-white"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600/10 text-brand-700">
                  <Icon name={a.icon} className="h-4.5 w-4.5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-ink-900">{a.role}</span>
                  <span className="block text-xs text-ink-500">{a.email}</span>
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Link href="/" className="mt-8 text-sm font-medium text-ink-500 hover:text-brand-700">
        ← Back to home
      </Link>
    </main>
  );
}
