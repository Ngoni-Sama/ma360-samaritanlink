"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { Brand } from "@/components/ui/Brand";

const MAIN_SITE = "https://medaccess360.com";

// Left group links back to the main MedAccess360 site; the anchors jump within
// the SamaritanLink landing page.
const LINKS = [
  { href: `${MAIN_SITE}/about`, label: "About", external: true },
  { href: `${MAIN_SITE}/our-work`, label: "Our Work", external: true },
  { href: "#solution", label: "How It Works", external: false },
  { href: `${MAIN_SITE}/get-involved`, label: "Get Involved", external: true },
];

export function LandingNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-ink-100 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" aria-label="MedAccess360 SamaritanLink home">
          <Brand variant="full" />
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {LINKS.map((l) =>
            l.external ? (
              <a key={l.label} href={l.href} className="text-sm font-semibold text-ink-700 hover:text-brand-600">
                {l.label}
              </a>
            ) : (
              <a key={l.label} href={l.href} className="text-sm font-semibold text-ink-700 hover:text-brand-600">
                {l.label}
              </a>
            ),
          )}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <a href="mailto:contact@medaccess360.com" className="btn-ghost text-sm">
            <Icon name="Mail" className="h-4 w-4" /> Get Help
          </a>
          <Link href="/login" className="btn-primary">
            Access SamaritanLink
            <Icon name="ArrowRight" className="h-4 w-4" />
          </Link>
        </div>

        <button className="btn-ghost px-2 md:hidden" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          <Icon name={open ? "X" : "Menu"} className="h-5 w-5" />
        </button>
      </div>

      {open && (
        <div className="border-t border-ink-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1">
            {LINKS.map((l) => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-4 py-3 text-sm font-semibold text-ink-700 hover:bg-brand-50"
              >
                {l.label}
              </a>
            ))}
            <Link href="/login" className="btn-primary mt-2 w-full" onClick={() => setOpen(false)}>
              Access SamaritanLink
              <Icon name="ArrowRight" className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
