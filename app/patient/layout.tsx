import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [
  { href: "/patient", label: "Overview" },
  { href: "/patient/book", label: "Book appointment" },
  { href: "/patient/appointments", label: "My appointments" },
  { href: "/patient/profile", label: "Health card & profile" },
];

export default async function PatientLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "PATIENT") redirect("/");

  return (
    <DashboardShell roleLabel="Patient" fullName={session.fullName} navItems={NAV}>
      {children}
    </DashboardShell>
  );
}
