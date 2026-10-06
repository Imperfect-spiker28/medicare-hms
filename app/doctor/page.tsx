"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Card, Button, StatusPill, TokenBadge, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";

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

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="font-display text-2xl text-foreground">Schedule</h1>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="rounded-xl border border-border bg-surface px-3.5 py-2 text-sm text-foreground focus:border-primary outline-none"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : appointments.length === 0 ? (
        <Card><EmptyState title="No appointments for this date" /></Card>
      ) : (
        <div className="grid gap-3">
          {appointments.map((a) => (
            <Card key={a.id} className="p-5 flex items-center gap-4 flex-wrap">
              <TokenBadge number={a.tokenNumber} />
              <div className="flex-1 min-w-[200px]">
                <Link href={`/doctor/patients/${a.patientId}`} className="font-medium text-foreground hover:text-primary">
                  {a.patientName}
                </Link>
                <p className="text-sm text-muted">
                  {a.startTime} &middot; {a.type.replace("_", " ")} &middot; {a.patientPhone}
                </p>
                <p className="text-sm text-muted">{a.reasonForVisit}</p>
              </div>
              <div className="flex flex-col items-end gap-2">
                <StatusPill status={a.status} />
                <div className="flex gap-2">
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
                  {a.status === "IN_CONSULTATION" || a.status === "COMPLETED" ? (
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
