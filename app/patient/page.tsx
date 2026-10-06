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
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 flex-wrap gap-4">
        <div>
          <p className="text-sm text-muted mb-0.5">{greeting} 👋</p>
          <h1 className="font-display text-2xl text-foreground">
            {patient?.fullName || session?.fullName}
          </h1>
          <p className="text-xs text-muted mt-1 font-mono tracking-wide bg-primary-tint text-primary-dark inline-block px-2 py-0.5 rounded-md">
            {patient?.patientCode || "MCH-2026-000001"}
          </p>
        </div>
        <Link href="/patient/book">
          <Button>
            <CalendarPlus size={16} /> Book appointment
          </Button>
        </Link>
      </div>

      {/* Stat row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<CalendarCheck size={18} />}
          label="Upcoming"
          value={upcoming.length}
          sub="appointments"
          color="primary"
        />
        <StatCard
          icon={<Activity size={18} />}
          label="Completed"
          value={completedCount}
          sub="visits"
          color="success"
        />
        <StatCard
          icon={<BookOpen size={18} />}
          label="Prescriptions"
          value={recentPrescriptions.length}
          sub="on record"
          color="accent"
        />
        <StatCard
          icon={<FlaskConical size={18} />}
          label="Lab reports"
          value="—"
          sub="check reports tab"
          color="warning"
        />
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/patient/book">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium text-foreground hover:bg-primary-tint hover:border-primary hover:text-primary-dark transition-colors cursor-pointer">
            <CalendarPlus size={15} /> New appointment
          </button>
        </Link>
        <Link href="/patient/labs">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium text-foreground hover:bg-primary-tint hover:border-primary hover:text-primary-dark transition-colors cursor-pointer">
            <FlaskConical size={15} /> Lab reports
          </button>
        </Link>
        <Link href="/patient/appointments">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-surface text-sm font-medium text-foreground hover:bg-primary-tint hover:border-primary hover:text-primary-dark transition-colors cursor-pointer">
            <Activity size={15} /> All appointments
          </button>
        </Link>
      </div>

      {/* Upcoming appointments */}
      <h2 className="font-display text-lg text-foreground mb-3">Upcoming appointments</h2>
      {upcoming.length === 0 ? (
        <Card>
          <EmptyState title="No upcoming appointments" hint="Book one to see your token here." />
        </Card>
      ) : (
        <div className="grid gap-3 mb-10">
          {upcoming.map((a) => (
            <Card key={a.id} className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
              <TokenBadge number={a.tokenNumber} />
              <div className="flex-1">
                <p className="font-medium text-foreground">{a.doctorName || "Doctor"}</p>
                <p className="text-sm text-muted">
                  {a.departmentName || "Department"} &middot; {a.date} at {a.startTime}
                </p>
              </div>
              <StatusPill status={a.status} />
            </Card>
          ))}
        </div>
      )}

      {/* Recent prescriptions */}
      <h2 className="font-display text-lg text-foreground mb-3">Recent prescriptions</h2>
      {recentPrescriptions.length === 0 ? (
        <Card>
          <EmptyState title="No prescriptions yet" hint="Prescriptions from your doctors will appear here." />
        </Card>
      ) : (
        <div className="grid gap-3">
          {recentPrescriptions.map((rx) => (
            <Card key={rx.id} className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-primary-tint flex items-center justify-center flex-shrink-0">
                  <FileText size={14} className="text-primary" />
                </div>
                <p className="font-medium text-foreground">{rx.doctorName || "Doctor"}</p>
                <span className="text-xs text-muted ml-auto">
                  {new Date(rx.createdAt).toLocaleDateString()}
                </span>
              </div>
              <ul className="text-sm text-muted space-y-1 pl-9">
                {rx.items.map((item, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <span className="w-1 h-1 rounded-full bg-muted inline-block flex-shrink-0" />
                    {item.medicine} — {item.dosage}, {item.frequency}, {item.durationDays} days
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
