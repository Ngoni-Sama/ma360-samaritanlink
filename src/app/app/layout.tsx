import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { AppShell } from "@/components/app/AppShell";
import type { Role } from "@/lib/data/types";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <AppShell role={user.role as Role} name={user.name}>
      {children}
    </AppShell>
  );
}
