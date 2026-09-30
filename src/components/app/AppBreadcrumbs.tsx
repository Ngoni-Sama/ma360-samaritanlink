"use client";

import { usePathname } from "next/navigation";
import { Breadcrumbs, type Crumb } from "@/components/ui/Breadcrumbs";

// Friendly labels for app path segments.
const LABELS: Record<string, string> = {
  app: "Dashboard",
  patients: "Patient Search",
  navigator: "Health Navigator",
  screening: "Screening",
  diagnostics: "Diagnostics",
  pharmacy: "Pharmacy Connect",
  referrals: "Referrals",
  directory: "Directory",
  journey: "My Care Journey",
  intelligence: "M&E Dashboard",
};

export function AppBreadcrumbs() {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean); // e.g. ["app","patients","SL-P-..."]
  if (segments.length <= 1) return null; // hide on the dashboard root

  const crumbs: Crumb[] = [{ label: "Dashboard", href: "/app" }];
  let acc = "/app";
  for (let i = 1; i < segments.length; i++) {
    const seg = segments[i];
    acc += `/${seg}`;
    const isId = /^SL-|^[a-z0-9]{20,}$/i.test(seg); // patient/provider ids
    crumbs.push({ label: isId ? decodeURIComponent(seg) : LABELS[seg] ?? seg, href: i === segments.length - 1 ? undefined : acc });
  }
  return <AppBreadcrumbsInner crumbs={crumbs} />;
}

function AppBreadcrumbsInner({ crumbs }: { crumbs: Crumb[] }) {
  return <Breadcrumbs items={crumbs} />;
}
