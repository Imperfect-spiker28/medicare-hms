"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { LogOut, Menu, X, Stethoscope } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
}

export function DashboardShell({
  roleLabel,
  fullName,
  navItems,
  children,
}: {
  roleLabel: string;
  fullName: string;
  navItems: NavItem[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const nav = (
    <nav className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
              active
                ? "bg-primary text-white"
                : "text-foreground hover:bg-primary-tint"
            }`}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-primary-dark">
          <Stethoscope size={20} /> Medicare
        </Link>
        <button onClick={() => setOpen(!open)} aria-label="Toggle menu">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-surface border-b border-border px-4 py-3">
          {nav}
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger-tint"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border bg-surface px-4 py-6">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-lg text-primary-dark px-2 mb-8">
          <Stethoscope size={22} /> Medicare Hospital
        </Link>
        <div className="px-2 mb-4">
          <p className="text-xs uppercase tracking-wide text-muted">{roleLabel}</p>
          <p className="font-medium text-foreground truncate">{fullName}</p>
        </div>
        {nav}
        <div className="mt-auto">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger-tint"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">{children}</main>
    </div>
  );
}
