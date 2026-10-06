import Link from "next/link";
import { cookies } from "next/headers";
import { getSession } from "@/lib/auth";
import { Card, Button, StatusPill, TokenBadge, EmptyState } from "@/components/ui";
import { CalendarPlus, FileText } from "lucide-react";

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
  const recentPrescriptions = (data?.prescriptions || []).slice(-3).reverse();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl text-foreground">
            Welcome, {patient?.fullName || session?.fullName}
          </h1>
          <p className="text-sm text-muted">
            Health card: {patient?.patientCode || "MCH-2026-000001"}
          </p>
        </div>
        <Link href="/patient/book">
          <Button>
            <CalendarPlus size={16} /> Book appointment
          </Button>
        </Link>
      </div>

      <h2 className="font-display text-lg text-foreground mb-3">Upcoming appointments</h2>
      {upcoming.length === 0 ? (
        <Card>
          <EmptyState title="No upcoming appointments" hint="Book one to see your token here." />
        </Card>
      ) : (
        <div className="grid gap-3 mb-10">
          {upcoming.map((a) => (
            <Card key={a.id} className="p-5 flex items-center gap-4">
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

      <h2 className="font-display text-lg text-foreground mb-3">Recent prescriptions</h2>
      {recentPrescriptions.length === 0 ? (
        <Card>
          <EmptyState title="No prescriptions yet" />
        </Card>
      ) : (
        <div className="grid gap-3">
          {recentPrescriptions.map((rx) => (
            <Card key={rx.id} className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <FileText size={16} className="text-primary" />
                <p className="font-medium text-foreground">{rx.doctorName || "Doctor"}</p>
                <span className="text-xs text-muted ml-auto">
                  {new Date(rx.createdAt).toLocaleDateString()}
                </span>
              </div>
              <ul className="text-sm text-muted space-y-1">
                {rx.items.map((item, i) => (
                  <li key={i}>
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
