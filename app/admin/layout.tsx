import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { DashboardShell } from "@/components/dashboard-shell";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/doctors", label: "Doctors" },
  { href: "/admin/departments", label: "Departments" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "ADMIN") redirect("/");

  return (
    <DashboardShell roleLabel="Administrator" fullName={session.fullName} navItems={NAV}>
      {children}
    </DashboardShell>
  );
}
