import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [{ href: "/reception", label: "Front desk" }];

export default async function ReceptionLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "RECEPTIONIST" && session.role !== "ADMIN") redirect("/");

  return (
    <DashboardShell roleLabel="Reception" fullName={session.fullName} navItems={NAV}>
      {children}
    </DashboardShell>
  );
}
