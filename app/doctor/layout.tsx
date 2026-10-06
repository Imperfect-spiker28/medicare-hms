import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [{ href: "/doctor", label: "Today's schedule" }];

export default async function DoctorLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "DOCTOR") redirect("/");

  return (
    <DashboardShell roleLabel="Doctor" fullName={session.fullName} navItems={NAV}>
      {children}
    </DashboardShell>
  );
}
