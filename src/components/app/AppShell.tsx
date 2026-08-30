"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { ROLE_LABELS } from "@/lib/data/demo";
import { providerForRole } from "@/lib/data/connected";
import type { Role } from "@/lib/data/types";

const NAV: Record<Role, { href: string; label: string; icon: string }[]> = {
  patient: [
    { href: "/app", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/app/journey", label: "My Care Journey", icon: "Route" },
    { href: "/app/navigator", label: "Health Navigator", icon: "Compass" },
    { href: "/app/screening", label: "Screening", icon: "Activity" },
    { href: "/app/diagnostics", label: "Diagnostics", icon: "FlaskConical" },
    { href: "/app/pharmacy", label: "Pharmacy Connect", icon: "Pill" },
    { href: "/app/referrals", label: "Referrals", icon: "Route" },
  ],
  health_worker: [
    { href: "/app", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", icon: "Search" },
    { href: "/app/screening", label: "Screening", icon: "Activity" },
    { href: "/app/referrals", label: "Referrals", icon: "Route" },
  ],
  professional: [
    { href: "/app", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", icon: "Search" },
    { href: "/app/diagnostics", label: "Diagnostics", icon: "FlaskConical" },
    { href: "/app/referrals", label: "Referrals", icon: "Route" },
  ],
  pharmacy: [
    { href: "/app", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", icon: "Search" },
    { href: "/app/pharmacy", label: "Pharmacy Connect", icon: "Pill" },
  ],
  admin: [
    { href: "/app", label: "Dashboard", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", icon: "Search" },
    { href: "/app/screening", label: "Screening", icon: "Activity" },
    { href: "/app/referrals", label: "Referrals", icon: "Route" },
    { href: "/app/diagnostics", label: "Diagnostics", icon: "FlaskConical" },
    { href: "/app/pharmacy", label: "Pharmacy Connect", icon: "Pill" },
  ],
};

export function AppShell({
  role,
  name,
  children,
}: {
  role: Role;
  name: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const nav = NAV[role] ?? NAV.patient;
  const provider = providerForRole(role);

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-0 z-40 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="glass-strong flex items-center justify-between rounded-full px-3 py-2 sm:px-5">
          <div className="flex items-center gap-2.5">
            <button className="btn-ghost px-2 lg:hidden" onClick={() => setOpen((v) => !v)} aria-label="Menu">
              <Icon name={open ? "X" : "Menu"} className="h-5 w-5" />
            </button>
            <Link href="/app" className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/ma360-mark.png" alt="MA360 SamaritanLink" className="h-8 w-8 object-contain" />
              <span className="hidden text-sm font-bold text-ink-900 sm:block">MA360 SamaritanLink</span>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="pill hidden border border-ink-200 bg-white/70 text-ink-600 sm:inline-flex">
              <Icon name="ShieldCheck" className="h-3.5 w-3.5" /> Demo
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink-900">{name}</p>
              <p className="text-[11px] leading-tight text-ink-500">
                {ROLE_LABELS[role]}
                {provider && <span className="ml-1.5 font-mono text-brand-600">{provider.providerId}</span>}
              </p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button className="btn-ghost px-2.5" type="submit" aria-label="Log out" title="Log out">
                <Icon name="LogOut" className="h-4.5 w-4.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-4 px-3 py-4 sm:px-4">
        {/* Sidebar */}
        <aside
          className={`${open ? "block" : "hidden"} fixed inset-x-3 top-20 z-30 lg:static lg:block lg:w-60 lg:shrink-0`}
        >
          <nav className="glass-panel space-y-1 p-3">
            {nav.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-sm font-medium transition ${
                    active ? "bg-brand-600 text-white shadow-glass" : "text-ink-700 hover:bg-white/70"
                  }`}
                >
                  <Icon name={item.icon} className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
