"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, Button, StatusPill, TokenBadge, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { CalendarCheck, Clock3, CheckCircle2, XCircle, Users } from "lucide-react";

interface Appointment {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  date: string;
  startTime: string;
  status: string;
  type: string;
  reasonForVisit: string;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

const NEXT_STATUS: Record<string, { label: string; status: string }[]> = {
  CONFIRMED: [{ label: "Start consultation", status: "IN_CONSULTATION" }, { label: "No-show", status: "NO_SHOW" }],
  CHECKED_IN: [{ label: "Start consultation", status: "IN_CONSULTATION" }],
  IN_CONSULTATION: [{ label: "Mark completed", status: "COMPLETED" }],
};

function SkeletonCard() {
  return (
    <Card className="p-5 flex items-center gap-4">
      <div className="w-16 h-16 rounded-xl bg-border animate-pulse" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-36 rounded bg-border animate-pulse" />
        <div className="h-3 w-52 rounded bg-border animate-pulse" />
        <div className="h-3 w-40 rounded bg-border animate-pulse" />
      </div>
      <div className="h-7 w-24 rounded-full bg-border animate-pulse" />
    </Card>
  );
}

export default function DoctorSchedulePage() {
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<{ appointments: Appointment[] }>(`/api/appointments?date=${date}`)
      .then((d) => setAppointments(d.appointments))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    let ignore = false;
    apiFetch<{ appointments: Appointment[] }>(`/api/appointments?date=${date}`)
      .then((d) => {
        if (!ignore) setAppointments(d.appointments);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [date]);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  // Computed stats
  const totalCount = appointments.length;
  const checkedIn = appointments.filter((a) => a.status === "CHECKED_IN").length;
  const inConsultation = appointments.filter((a) => a.status === "IN_CONSULTATION").length;
  const completed = appointments.filter((a) => a.status === "COMPLETED").length;
  const noShow = appointments.filter((a) => a.status === "NO_SHOW").length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-foreground">My Schedule</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground focus:border-primary outline-none cursor-pointer"
        />
      </div>

      {/* Stat row - only show when there are appointments */}
      {!loading && totalCount > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {[
            { icon: <Users size={16} />, label: "Total", value: totalCount, color: "bg-primary-tint text-primary" },
            { icon: <Clock3 size={16} />, label: "Waiting", value: checkedIn, color: "bg-accent-tint text-accent-dark" },
            { icon: <CalendarCheck size={16} />, label: "Consulting", value: inConsultation, color: "bg-warning-tint text-warning" },
            { icon: <CheckCircle2 size={16} />, label: "Completed", value: completed, color: "bg-success-tint text-success" },
            { icon: <XCircle size={16} />, label: "No-show", value: noShow, color: "bg-danger-tint text-danger" },
          ].map((s) => (
            <Card key={s.label} className="p-3 flex items-center gap-2.5">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${s.color}`}>
                {s.icon}
              </div>
              <div>
                <p className="font-display text-lg text-foreground leading-none">{s.value}</p>
                <p className="text-[10px] text-muted uppercase tracking-wide">{s.label}</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Appointment list */}
      {loading ? (
        <div className="grid gap-3">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : appointments.length === 0 ? (
        <Card><EmptyState title="No appointments for this date" hint="Select a different date or check back later." /></Card>
      ) : (
        <div className="grid gap-3">
          {appointments.map((a) => (
            <Card key={a.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <TokenBadge number={a.tokenNumber} size="sm" />
                <div className="sm:hidden flex-1 flex justify-end">
                  <StatusPill status={a.status} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <Link href={`/doctor/patients/${a.patientId}`} className="font-semibold text-foreground hover:text-primary transition-colors block">
                  {a.patientName}
                </Link>
                <p className="text-xs sm:text-sm text-muted">
                  {a.startTime} &middot; {a.type.replace("_", " ")} &middot; {a.patientPhone}
                </p>
                <p className="text-xs text-muted italic mt-0.5">{a.reasonForVisit}</p>
              </div>
              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                <div className="hidden sm:block">
                  <StatusPill status={a.status} />
                </div>
                <div className="flex items-center gap-1.5 flex-wrap justify-end">
                  {(NEXT_STATUS[a.status] || []).map((opt) => (
                    <Button
                      key={opt.status}
                      size="sm"
                      variant="secondary"
                      disabled={busyId === a.id}
                      onClick={() => updateStatus(a.id, opt.status)}
                    >
                      {opt.label}
                    </Button>
                  ))}
                  {(a.status === "IN_CONSULTATION" || a.status === "COMPLETED") ? (
                    <Link href={`/doctor/patients/${a.patientId}?appt=${a.id}`}>
                      <Button size="sm">Open record</Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
