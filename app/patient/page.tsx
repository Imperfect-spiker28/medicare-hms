import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { Card, Button, StatusPill, TokenBadge, EmptyState, StatCard } from "@/components/ui";
import { CalendarPlus, FileText, FlaskConical, CalendarCheck, Activity, BookOpen } from "lucide-react";

const API_BASE = process.env.API_BASE_URL || "http://127.0.0.1:8080";

interface PatientResponse {
  patient: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    patientCode?: string;
  };
  appointments: Array<{
    id: string;
    tokenNumber: number;
    patientId: string;
    doctorId: string;
    doctorName?: string;
    departmentName?: string;
    date: string;
    startTime: string;
    status: string;
  }>;
  prescriptions: Array<{
    id: string;
    doctorId: string;
    doctorName?: string;
    createdAt: string;
    items: Array<{
      medicine: string;
      dosage: string;
      frequency: string;
      durationDays: number;
    }>;
  }>;
}

async function getPatientDashboardData(userId: string): Promise<PatientResponse | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("mch_session")?.value;
    const res = await fetch(`${API_BASE}/api/patients/${userId}`, {
      headers: token ? { Authorization: `Bearer ${token}`, Cookie: `mch_session=${token}` } : {},
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PatientResponse;
  } catch {
    return null;
  }
}

export default async function PatientHome() {
  const session = await getSession();
  const data = session ? await getPatientDashboardData(session.userId) : null;

  const patient = data?.patient;
  const appointments = data?.appointments || [];
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter(
    (a) => a.date >= today && !["CANCELLED", "COMPLETED", "NO_SHOW"].includes(a.status)
  );
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;
  const recentPrescriptions = (data?.prescriptions || []).slice(-3).reverse();

  // Greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="space-y-8">
      {/* Top Welcome & Health Card Identifier */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3 pb-6 border-b border-border/80">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted font-medium mb-1">
            {greeting} &middot; Patient Portal
          </p>
          <h1 className="font-editorial text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            {patient?.fullName || session?.fullName}
          </h1>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-xs text-muted">MRN:</span>
          <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-md bg-surface-cream text-foreground border border-border">
            {patient?.patientCode || "MCH-2026-000001"}
          </span>
        </div>
      </div>

      {/* Main Focus: Booking Callout + 2 Compact Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Primary Action Hero (2 cols): Booking */}
        <div className="lg:col-span-2 bg-gradient-to-br from-primary-dark via-primary to-[#0f4642] text-white rounded-2xl p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-sm">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 rounded-full bg-white/5 pointer-events-none" />
          <div className="relative z-10 max-w-lg">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-white/90 text-[11px] font-medium tracking-wide uppercase mb-3">
              <CalendarPlus size={12} className="text-accent" /> Consultation Desk
            </span>
            <h2 className="font-editorial text-2xl sm:text-3xl font-normal leading-snug mb-2">
              Need to see a doctor?
            </h2>
            <p className="text-sm text-white/80 leading-relaxed font-light mb-6">
              Choose from 6 medical departments, pick your preferred specialist, and secure your OPD token in advance.
            </p>
          </div>
          <div className="relative z-10 flex flex-wrap items-center gap-3">
            <Link href="/patient/book">
              <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white text-primary-dark hover:bg-surface-cream font-medium text-sm transition-colors cursor-pointer shadow-xs">
                <CalendarPlus size={16} className="text-primary" /> Book appointment now &rarr;
              </button>
            </Link>
            <Link href="/patient/labs">
              <button className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-medium transition-colors cursor-pointer border border-white/15">
                <FlaskConical size={14} /> View lab reports
              </button>
            </Link>
          </div>
        </div>

        {/* 2 Compact Metrics (1 col stacked) */}
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
          <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Upcoming</p>
              <p className="font-editorial text-3xl text-foreground font-normal leading-none">
                {upcoming.length}
              </p>
              <p className="text-[11px] text-muted mt-1">active visit{upcoming.length === 1 ? "" : "s"}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-primary-tint text-primary flex items-center justify-center flex-shrink-0">
              <CalendarCheck size={20} />
            </div>
          </div>

          <div className="bg-surface border border-border rounded-2xl p-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Completed</p>
              <p className="font-editorial text-3xl text-foreground font-normal leading-none">
                {completedCount}
              </p>
              <p className="text-[11px] text-muted mt-1">past consultation{completedCount === 1 ? "" : "s"}</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-terracotta-tint text-terracotta flex items-center justify-center flex-shrink-0">
              <Activity size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Clinical Log: Appointments on Left, Prescriptions on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-2">
        {/* Left: Upcoming Appointments */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-editorial text-xl text-foreground font-normal">Upcoming visits</h3>
            {upcoming.length > 0 && (
              <Link href="/patient/appointments" className="text-xs text-primary hover:text-primary-dark font-medium">
                View all &rarr;
              </Link>
            )}
          </div>

          {upcoming.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-2xl p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-surface-cream text-muted flex items-center justify-center mx-auto mb-2">
                <CalendarCheck size={18} />
              </div>
              <p className="text-sm font-medium text-foreground">No upcoming visits</p>
              <p className="text-xs text-muted mt-0.5 mb-3">Your scheduled appointments will appear here.</p>
              <Link href="/patient/book">
                <span className="text-xs text-primary font-medium hover:underline cursor-pointer">
                  Schedule your first visit &rarr;
                </span>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {upcoming.map((a) => (
                <div
                  key={a.id}
                  className="bg-surface border border-border rounded-2xl p-4 flex items-center gap-4 hover:border-primary/40 transition-colors"
                >
                  <TokenBadge number={a.tokenNumber} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm truncate">{a.doctorName || "Specialist"}</p>
                    <p className="text-xs text-muted">
                      {a.departmentName || "General"} &middot; {a.date} at {a.startTime}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Recent Prescriptions */}
        <div>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="font-editorial text-xl text-foreground font-normal">Prescriptions</h3>
            {recentPrescriptions.length > 0 && (
              <span className="text-xs text-muted">{recentPrescriptions.length} on file</span>
            )}
          </div>

          {recentPrescriptions.length === 0 ? (
            <div className="bg-surface border border-dashed border-border rounded-2xl p-6 text-center">
              <div className="w-10 h-10 rounded-xl bg-surface-cream text-muted flex items-center justify-center mx-auto mb-2">
                <FileText size={18} />
              </div>
              <p className="text-sm font-medium text-foreground">No prescriptions on record</p>
              <p className="text-xs text-muted mt-0.5">
                Medications and instructions prescribed by your physician will be stored here.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentPrescriptions.map((rx) => (
                <div key={rx.id} className="bg-surface border border-border rounded-2xl p-4">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <p className="font-medium text-foreground text-sm">{rx.doctorName || "Doctor"}</p>
                    <span className="text-[11px] text-muted">
                      {new Date(rx.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <ul className="text-xs text-muted space-y-1">
                    {rx.items.map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-terracotta inline-block flex-shrink-0" />
                        <span className="font-medium text-foreground">{item.medicine}</span>
                        <span>&middot;</span>
                        <span>{item.dosage}, {item.frequency} ({item.durationDays}d)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
