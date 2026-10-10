"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, Button, StatusPill } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import {
  Users,
  Stethoscope,
  Building2,
  CalendarClock,
  TrendingUp,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Activity,
  Layers,
  Sparkles,
  Calendar,
} from "lucide-react";

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  todaysAppointmentCount: number;
  statusCounts: Record<string, number>;
  byDepartment: { department: string; appointments: number; doctors: number }[];
  last7Days: { date: string; count: number }[];
}

interface DoctorRow {
  userId?: string;
  id?: string;
  fullName?: string;
  specialization?: string;
  departmentName?: string;
  department?: { name: string } | null;
  isActive?: boolean;
}

const STATUS_CONFIG: Record<string, { label: string; badge: string; bar: string }> = {
  CONFIRMED: { label: "Confirmed", badge: "bg-primary-tint text-primary-dark border-primary/20", bar: "bg-primary" },
  CHECKED_IN: { label: "Checked In", badge: "bg-accent-tint text-accent-dark border-accent/20", bar: "bg-accent" },
  IN_CONSULTATION: { label: "In Chamber", badge: "bg-warning-tint text-warning border-warning/20", bar: "bg-warning" },
  COMPLETED: { label: "Completed", badge: "bg-success-tint text-success border-success/20", bar: "bg-success" },
  CANCELLED: { label: "Cancelled", badge: "bg-danger-tint text-danger border-danger/20", bar: "bg-danger" },
  NO_SHOW: { label: "No Show", badge: "bg-danger-tint text-danger border-danger/20", bar: "bg-danger" },
  REQUESTED: { label: "Requested", badge: "bg-surface-cream text-muted border-border", bar: "bg-muted" },
};

function formatDisplayDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateStr;
  }
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      apiFetch<Stats>("/api/admin/stats").catch(() => null),
      apiFetch<{ doctors: DoctorRow[] }>("/api/admin/doctors").catch(() => ({ doctors: [] })),
    ])
      .then(([statsData, docData]) => {
        if (statsData) setStats(statsData);
        if (docData?.doctors) setDoctors(docData.doctors);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const maxVolume = useMemo(() => {
    if (!stats || !stats.last7Days || stats.last7Days.length === 0) return 1;
    return Math.max(...stats.last7Days.map((d) => d.count), 1);
  }, [stats]);

  const totalAppointmentsStatus = useMemo(() => {
    if (!stats?.statusCounts) return 0;
    return Object.values(stats.statusCounts).reduce((a, b) => a + b, 0);
  }, [stats]);

  // Derived pending or actionable items
  const pendingArrivals = stats?.statusCounts?.CONFIRMED || 0;
  const inChamber = stats?.statusCounts?.IN_CONSULTATION || 0;
  const totalVolume7Days = stats?.last7Days?.reduce((sum, d) => sum + d.count, 0) || 0;

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      {/* Admin Workspace Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            <span className="text-primary font-bold">Medicare Hospital</span>
            <span>&middot;</span>
            <span>Administration</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            Hospital overview
          </h1>
          <p className="text-sm text-muted mt-1">
            Monitor clinical operations, track patient volume, and manage hospital resources.
          </p>
        </div>

        {/* Primary Administrative Actions */}
        <div className="flex items-center gap-3 flex-wrap self-start lg:self-auto">
          <Link href="/admin/doctors">
            <Button size="md" className="bg-primary hover:bg-primary-dark text-white shadow-xs">
              <Plus size={15} /> Add doctor
            </Button>
          </Link>
          <Link href="/admin/departments">
            <Button variant="secondary" size="md" className="border-border bg-surface hover:bg-surface-cream text-foreground">
              <Building2 size={15} /> Manage departments &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Primary Operational Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Registered Patients</p>
            <p className="font-editorial text-3xl text-foreground font-normal leading-none">
              {loading ? "—" : stats?.totalPatients ?? 0}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Digital health records</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Active Doctors</p>
            <p className="font-editorial text-3xl text-primary font-normal leading-none">
              {loading ? "—" : stats?.totalDoctors ?? 0}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Across {stats?.totalDepartments ?? 6} departments</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <Stethoscope size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Today&apos;s Appointments</p>
            <p className="font-editorial text-3xl text-terracotta font-normal leading-none">
              {loading ? "—" : stats?.todaysAppointmentCount ?? 0}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Booked for current date</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-cream text-terracotta flex items-center justify-center shrink-0">
            <CalendarClock size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Pending Actions</p>
            <p className="font-editorial text-3xl text-amber-700 font-normal leading-none">
              {loading ? "—" : pendingArrivals + inChamber}
            </p>
            <p className="text-[11px] text-muted mt-1.5">{pendingArrivals} awaiting &middot; {inChamber} in chamber</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <AlertCircle size={18} />
          </div>
        </div>
      </div>

      {/* Main Administrative Canvas: 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Cols: Analytics & Operational Health */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Appointment Activity Trend */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-3 border-b border-border/70">
              <div>
                <h2 className="font-editorial text-xl text-foreground font-normal">Appointment activity</h2>
                <p className="text-xs text-muted">Daily booking volume over the last 7 days</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted self-start sm:self-auto">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-primary" />
                <span>Total: <strong className="text-foreground">{totalVolume7Days} visits</strong></span>
              </div>
            </div>

            {loading ? (
              <div className="h-44 flex items-center justify-center animate-pulse text-muted text-xs">
                Loading activity trends...
              </div>
            ) : totalVolume7Days === 0 ? (
              <div className="py-10 text-center border border-dashed border-border rounded-xl">
                <TrendingUp size={24} className="text-muted mx-auto mb-2 opacity-50" />
                <p className="text-xs font-medium text-foreground">No appointment activity recorded</p>
                <p className="text-[11px] text-muted mt-0.5">Booking volume over the past 7 days will be visualized here.</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-end gap-3 h-44 pt-4 px-2">
                  {stats?.last7Days.map((d) => {
                    const pct = Math.max((d.count / maxVolume) * 100, 6);
                    const isToday = d.date === todayStr;
                    return (
                      <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className={`text-[11px] font-semibold transition-opacity ${d.count > 0 ? "text-primary opacity-100" : "text-muted opacity-40 group-hover:opacity-100"}`}>
                          {d.count}
                        </span>
                        <div
                          className={`w-full rounded-t-lg transition-all ${
                            isToday
                              ? "bg-primary shadow-xs"
                              : "bg-primary/30 group-hover:bg-primary/60"
                          }`}
                          style={{ height: `${pct}%` }}
                          title={`${d.date}: ${d.count} appointments`}
                        />
                        <span className={`text-[10px] truncate max-w-full font-medium ${isToday ? "text-primary font-bold" : "text-muted"}`}>
                          {formatDisplayDate(d.date).split(",")[0]}
                        </span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between text-[11px] text-muted pt-2 border-t border-border/50">
                  <span>Showing last 7 calendar days</span>
                  <span className="text-primary font-medium">Daily slot capacity pace</span>
                </div>
              </div>
            )}
          </div>

          {/* Clinical Status Breakdown */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
              <div>
                <h2 className="font-editorial text-xl text-foreground font-normal">Status breakdown</h2>
                <p className="text-xs text-muted">Distribution across all historical hospital visits</p>
              </div>
              <span className="text-xs text-muted font-medium">
                {totalAppointmentsStatus} Total Records
              </span>
            </div>

            {loading ? (
              <div className="py-6 text-center text-xs text-muted animate-pulse">Loading status counts...</div>
            ) : totalAppointmentsStatus === 0 ? (
              <p className="text-xs text-muted py-4">No appointment status distribution available.</p>
            ) : (
              <div className="space-y-3.5">
                {Object.entries(stats?.statusCounts || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([status, count]) => {
                    const pct = Math.round((count / (totalAppointmentsStatus || 1)) * 100);
                    const cfg = STATUS_CONFIG[status] || {
                      label: status,
                      badge: "bg-surface-cream text-muted border-border",
                      bar: "bg-primary",
                    };
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md font-medium border ${cfg.badge}`}>
                            {cfg.label}
                          </span>
                          <span className="font-semibold text-foreground">
                            {count} <span className="text-muted font-normal text-[11px]">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-2 bg-surface-cream rounded-full overflow-hidden border border-border/50">
                          <div
                            className={`h-full rounded-full transition-all ${cfg.bar}`}
                            style={{ width: `${Math.max(pct, count > 0 ? 3 : 0)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* Department Capacity & Allocation */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-2xs">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/70">
              <div>
                <h2 className="font-editorial text-xl text-foreground font-normal">Department staffing &amp; load</h2>
                <p className="text-xs text-muted">Specialty physician allocations and total patient consultations</p>
              </div>
              <Link href="/admin/departments" className="text-xs font-semibold text-primary hover:underline">
                View all &rarr;
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3.5">
              {(stats?.byDepartment || []).map((d) => (
                <div
                  key={d.department}
                  className="bg-surface-cream/40 border border-border rounded-xl p-3.5 hover:border-primary/50 transition-colors"
                >
                  <p className="font-display font-bold text-sm text-foreground truncate">{d.department}</p>
                  <div className="flex items-center justify-between text-xs text-muted mt-2 pt-2 border-t border-border/50">
                    <span>
                      <strong className="text-foreground">{d.doctors}</strong> {d.doctors === 1 ? "Doctor" : "Doctors"}
                    </span>
                    <span>
                      <strong className="text-foreground">{d.appointments}</strong> Visits
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right 4 Cols: Hospital Resource Management & Fast Tools */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Hospital Resource Navigation Cards */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-2xs">
            <h3 className="font-display font-semibold text-sm text-foreground mb-1">Hospital Management</h3>
            <p className="text-xs text-muted mb-4">Core administration workflows and master configurations.</p>

            <div className="space-y-3">
              <Link
                href="/admin/doctors"
                className="w-full text-left p-3.5 rounded-xl bg-surface-cream/70 hover:bg-surface-cream border border-border/80 transition-all cursor-pointer flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-primary-tint text-primary flex items-center justify-center">
                    <Stethoscope size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">Doctors &amp; schedules</p>
                    <p className="text-[11px] text-muted">Profiles, availability and leave</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/admin/departments"
                className="w-full text-left p-3.5 rounded-xl bg-surface-cream/70 hover:bg-surface-cream border border-border/80 transition-all cursor-pointer flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-surface-cream text-terracotta flex items-center justify-center">
                    <Building2 size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-terracotta transition-colors">Departments</p>
                    <p className="text-[11px] text-muted">Specialties &amp; staff mapping</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>

              <Link
                href="/display"
                target="_blank"
                className="w-full text-left p-3.5 rounded-xl bg-surface-cream/70 hover:bg-surface-cream border border-border/80 transition-all cursor-pointer flex items-center justify-between group block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground group-hover:text-emerald-700 transition-colors">Live OPD Monitor</p>
                    <p className="text-[11px] text-muted">Lobby token stream screen</p>
                  </div>
                </div>
                <ArrowRight size={14} className="text-muted group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Active Physicians Roster */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-2xs">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/70">
              <h3 className="font-display font-semibold text-sm text-foreground">Medical Staff Roster</h3>
              <span className="text-[11px] text-muted">{doctors.length} Registered</span>
            </div>

            {doctors.length === 0 ? (
              <p className="text-xs text-muted py-2">No doctors currently registered.</p>
            ) : (
              <div className="space-y-2.5">
                {doctors.slice(0, 4).map((d) => (
                  <div
                    key={d.userId || d.id || d.fullName}
                    className="p-3 rounded-xl bg-surface-cream/60 border border-border/70 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-xs font-semibold text-foreground">{d.fullName}</p>
                      <p className="text-[11px] text-muted">
                        {d.specialization} &middot; {d.departmentName || d.department?.name || "General"}
                      </p>
                    </div>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" title="Active on staff" />
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 pt-3 border-t border-border/70">
              <Link href="/admin/doctors" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1 justify-center">
                Manage all {doctors.length} doctors &rarr;
              </Link>
            </div>
          </div>

          {/* Administrative Audit & Security Notice */}
          <div className="rounded-2xl border border-border/80 bg-surface-cream/50 p-4 text-xs text-muted space-y-2">
            <div className="flex items-center gap-2 font-semibold text-foreground">
              <ShieldCheck size={15} className="text-primary" />
              <span>Audit Logging Active</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              All administrative operations—including doctor provisioning, schedule adjustments, and department changes—are recorded in the PostgreSQL audit log with user principal timestamps.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
