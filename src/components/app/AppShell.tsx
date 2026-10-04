"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { AppBreadcrumbs } from "@/components/app/AppBreadcrumbs";
import { WorkflowToast } from "@/components/app/workflow/WorkflowToast";
import { ROLE_LABELS } from "@/lib/data/demo";
import { providerForRole } from "@/lib/data/connected";
import type { Role } from "@/lib/data/types";

interface NavItem { href: string; label: string; short: string; icon: string }

// Order matters: on phones the first items go in the bottom bar (thumb zone).
const NAV: Record<Role, NavItem[]> = {
  patient: [
    { href: "/app", label: "Dashboard", short: "Home", icon: "LayoutDashboard" },
    { href: "/app/journey", label: "My Care Journey", short: "Journey", icon: "Route" },
    { href: "/app/navigator", label: "Health Navigator", short: "Navigator", icon: "Compass" },
    { href: "/app/directory", label: "Find Services", short: "Services", icon: "Building2" },
    { href: "/app/screening", label: "Screening", short: "Screening", icon: "Activity" },
    { href: "/app/diagnostics", label: "Diagnostics", short: "Tests", icon: "FlaskConical" },
    { href: "/app/pharmacy", label: "Pharmacy Connect", short: "Pharmacy", icon: "Pill" },
    { href: "/app/referrals", label: "Referrals", short: "Referrals", icon: "Route" },
  ],
  health_worker: [
    { href: "/app", label: "Dashboard", short: "Home", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", short: "Patients", icon: "Search" },
    { href: "/app/referrals", label: "Referrals", short: "Referrals", icon: "Route" },
    { href: "/app/screening", label: "Screening", short: "Screening", icon: "Activity" },
    { href: "/app/directory", label: "Directory", short: "Directory", icon: "Building2" },
  ],
  professional: [
    { href: "/app", label: "Dashboard", short: "Home", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", short: "Patients", icon: "Search" },
    { href: "/app/referrals", label: "Referrals", short: "Referrals", icon: "Route" },
    { href: "/app/diagnostics", label: "Diagnostics", short: "Tests", icon: "FlaskConical" },
    { href: "/app/directory", label: "Directory", short: "Directory", icon: "Building2" },
  ],
  pharmacy: [
    { href: "/app", label: "Dashboard", short: "Home", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", short: "Patients", icon: "Search" },
    { href: "/app/pharmacy", label: "Pharmacy Connect", short: "Pharmacy", icon: "Pill" },
  ],
  laboratory: [
    { href: "/app", label: "Dashboard", short: "Home", icon: "LayoutDashboard" },
    { href: "/app/patients", label: "Patient Search", short: "Patients", icon: "Search" },
    { href: "/app/diagnostics", label: "Diagnostics", short: "Tests", icon: "FlaskConical" },
  ],
  admin: [
    { href: "/app", label: "Dashboard", short: "Home", icon: "LayoutDashboard" },
    { href: "/app/intelligence", label: "M&E Dashboard", short: "M&E", icon: "LineChart" },
    { href: "/app/patients", label: "Patient Search", short: "Patients", icon: "Search" },
    { href: "/app/referrals", label: "Referrals", short: "Referrals", icon: "Route" },
    { href: "/app/directory", label: "Directory", short: "Directory", icon: "Building2" },
    { href: "/app/screening", label: "Screening", short: "Screening", icon: "Activity" },
    { href: "/app/diagnostics", label: "Diagnostics", short: "Tests", icon: "FlaskConical" },
    { href: "/app/pharmacy", label: "Pharmacy Connect", short: "Pharmacy", icon: "Pill" },
  ],
};

function isActive(pathname: string, href: string) {
  return href === "/app" ? pathname === "/app" : pathname === href || pathname.startsWith(`${href}/`);
}

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
  const [open, setOpen] = useState(false); // mobile "More" sheet
  const nav = NAV[role] ?? NAV.patient;
  const provider = providerForRole(role);

  // Bottom bar: up to 5 slots. With more destinations, show 4 + "More".
  const hasMore = nav.length > 5;
  const bottom = hasMore ? nav.slice(0, 4) : nav;
  const moreActive = hasMore && nav.slice(4).some((i) => isActive(pathname, i.href));

  return (
    <div className="min-h-screen">
      {/* Top bar */}
      <div className="sticky top-[env(safe-area-inset-top,0px)] z-40 px-3 pt-3 sm:px-4 sm:pt-4">
        <div className="glass-strong flex items-center justify-between rounded-full py-1.5 pl-3 pr-1.5 sm:pl-5">
          <Link href="/app" className="flex min-h-11 items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ma360-mark.png" alt="" className="h-8 w-8 object-contain" />
            <span className="text-sm font-bold text-ink-900">MA360 SamaritanLink</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="pill hidden border border-ink-200 bg-white/70 text-ink-600 sm:inline-flex">
              <Icon name="ShieldCheck" className="h-3.5 w-3.5" /> Demo
            </span>
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold leading-tight text-ink-900">{name}</p>
              <p className="text-xs leading-tight text-ink-500">
                {ROLE_LABELS[role]}
                {provider && <span className="ml-1.5 font-mono text-brand-700">{provider.providerId}</span>}
              </p>
            </div>
            <form action="/api/auth/logout" method="post">
              <button
                type="submit"
                className="flex h-11 w-11 items-center justify-center rounded-full text-ink-600 transition hover:bg-white/80 hover:text-ink-900"
                aria-label="Log out"
                title="Log out"
              >
                <Icon name="LogOut" className="h-5 w-5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-6xl gap-4 px-3 py-4 sm:px-4">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block lg:w-60 lg:shrink-0">
          <nav aria-label="Main" className="glass-panel sticky top-24 space-y-1 p-3">
            {nav.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-2xl px-3.5 text-sm font-medium transition ${
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

        {/* Main — bottom padding keeps content clear of the mobile bottom bar */}
        <main className="min-w-0 flex-1 pb-28 lg:pb-0">
          <AppBreadcrumbs />
          {children}
        </main>
      </div>

      {/* Mobile "More" sheet, opened from the bottom bar */}
      {open && (
        <>
          <button type="button" aria-label="Close menu" onClick={() => setOpen(false)} className="fixed inset-0 z-40 bg-ink-950/30 lg:hidden" />
          <nav
            aria-label="More"
            className="glass-strong fixed inset-x-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom,0px))] z-50 max-h-[70vh] space-y-1 overflow-y-auto rounded-3xl p-3 lg:hidden"
          >
            {nav.slice(4).map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-medium ${
                    active ? "bg-brand-600 text-white" : "text-ink-800 hover:bg-white/80"
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </>
      )}

      {/* Mobile bottom navigation (thumb zone) */}
      <nav
        aria-label="Main"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/70 bg-white/90 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-lg lg:hidden"
      >
        <ul className="mx-auto flex max-w-lg gap-1 px-2 py-1.5">
          {bottom.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="min-w-0 flex-1">
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition ${
                    active ? "bg-brand-600/10 text-brand-800" : "text-ink-600 hover:bg-ink-50"
                  }`}
                >
                  <Icon name={item.icon} className="h-5 w-5" />
                  <span className="max-w-full truncate text-xs font-semibold">{item.short}</span>
                </Link>
              </li>
            );
          })}
          {hasMore && (
            <li className="min-w-0 flex-1">
              <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-expanded={open}
                className={`flex min-h-14 w-full flex-col items-center justify-center gap-0.5 rounded-2xl px-1 transition ${
                  open || moreActive ? "bg-brand-600/10 text-brand-800" : "text-ink-600 hover:bg-ink-50"
                }`}
              >
                <Icon name={open ? "X" : "Menu"} className="h-5 w-5" />
                <span className="text-xs font-semibold">More</span>
              </button>
            </li>
          )}
        </ul>
      </nav>

      <WorkflowToast />
    </div>
  );
}
