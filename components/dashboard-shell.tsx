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

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("");

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {navItems.map((item) => {
        const active = pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={`relative flex items-center rounded-xl px-3.5 py-2.5 text-xs font-medium transition-all ${
              active
                ? "bg-primary text-white shadow-xs font-semibold"
                : "text-muted hover:text-foreground hover:bg-surface-cream/80"
            }`}
          >
            {active && (
              <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-4 rounded-full bg-accent" />
            )}
            <span className={active ? "pl-2" : ""}>{item.label}</span>
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
        <button
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
          className="p-1.5 rounded-lg hover:bg-primary-tint transition-colors cursor-pointer"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
      {open && (
        <div className="md:hidden bg-surface border-b border-border px-4 py-3">
          {nav}
          <button
            onClick={logout}
            className="mt-2 w-full flex items-center gap-2 rounded-xl px-3.5 py-2.5 text-sm font-medium text-danger hover:bg-danger-tint cursor-pointer"
          >
            <LogOut size={16} /> Log out
          </button>
        </div>
      )}

      {/* Sidebar (desktop) */}
      <aside
        className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border px-4 py-6 bg-surface/80 backdrop-blur-sm"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 font-display font-semibold text-base text-primary-dark px-2 mb-1">
          <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <Stethoscope size={16} />
          </div>
          <span className="tracking-tight">Medicare Hospital</span>
        </Link>
        <p className="text-[10px] text-muted px-2 mb-6 tracking-wider uppercase font-medium">Irinjalakuda &middot; Thrissur</p>

        {/* User card */}
        <div className="flex items-center gap-3 bg-surface-cream/80 border border-border/80 rounded-xl px-3 py-2.5 mb-6">
          <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-display flex items-center justify-center text-xs font-bold flex-shrink-0 border border-primary/20">
            {initials}
          </div>
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-muted font-medium leading-none mb-1">{roleLabel}</p>
            <p className="font-medium text-foreground text-xs truncate">{fullName}</p>
          </div>
        </div>

        {nav}

        <div className="mt-auto pt-4 border-t border-border/70">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-medium text-muted hover:text-danger hover:bg-danger-tint transition-colors cursor-pointer"
          >
            <LogOut size={14} /> Log out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
    </div>
  );
}
