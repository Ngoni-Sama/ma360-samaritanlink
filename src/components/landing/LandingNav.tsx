"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

const LINKS = [
  { href: "#problem", label: "The Problem" },
  { href: "#solution", label: "How It Works" },
  { href: "#connects", label: "What We Connect" },
  { href: "#partners", label: "Partner With Us" },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 pt-4">
        <div className="glass-strong flex items-center justify-between rounded-full px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-white">
              <Icon name="HeartHandshake" className="h-5 w-5" />
            </span>
            <span className="leading-tight">
              <span className="block text-sm font-bold text-ink-900">MA360 SamaritanLink</span>
              <span className="block text-[11px] text-ink-500">MedAccess360 Foundation</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-ink-600 hover:text-brand-700">
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/login" className="btn-primary">
              Access SamaritanLink
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </div>

          <button
            className="btn-ghost px-2 md:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            <Icon name={open ? "X" : "Menu"} className="h-5 w-5" />
          </button>
        </div>

        {open && (
          <div className="glass-strong mt-2 rounded-3xl p-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="rounded-2xl px-4 py-3 text-sm font-medium text-ink-700 hover:bg-white/70"
                >
                  {l.label}
                </a>
              ))}
              <Link href="/login" className="btn-primary mt-2 w-full">
                Access SamaritanLink
                <Icon name="ArrowRight" className="h-4 w-4" />
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
