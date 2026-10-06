"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, StatusPill, TokenBadge, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";

interface Appointment {
  id: string;
  tokenNumber: number;
  doctorName?: string;
  departmentName?: string;
  date: string;
  startTime: string;
  status: string;
  reasonForVisit: string;
}

export default function PatientAppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<{ appointments: Appointment[] }>("/api/appointments")
      .then((d) => setAppointments(d.appointments))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let ignore = false;
    apiFetch<{ appointments: Appointment[] }>("/api/appointments")
      .then((d) => {
        if (!ignore) setAppointments(d.appointments);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  async function cancel(id: string) {
    if (!confirm("Cancel this appointment?")) return;
    setBusyId(id);
    setError("");
    try {
      await apiFetch(`/api/appointments/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ action: "CANCEL", cancelReason: "Cancelled by patient" }),
      });
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not cancel.");
    } finally {
      setBusyId(null);
    }
  }

  const today = new Date().toISOString().slice(0, 10);
  const upcoming = appointments.filter((a) => a.date >= today && a.status !== "CANCELLED" && a.status !== "COMPLETED");
  const past = appointments.filter((a) => !upcoming.includes(a));

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">My appointments</h1>
      {error && <p className="text-sm text-danger mb-4">{error}</p>}

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <>
          <h2 className="font-display text-lg text-foreground mb-3">Upcoming</h2>
          {upcoming.length === 0 ? (
            <Card className="mb-8"><EmptyState title="No upcoming appointments" /></Card>
          ) : (
            <div className="grid gap-3 mb-8">
              {upcoming.map((a) => (
                <Card key={a.id} className="p-5 flex items-center gap-4">
                  <TokenBadge number={a.tokenNumber} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{a.doctorName}</p>
                    <p className="text-sm text-muted">
                      {a.departmentName} &middot; {a.date} at {a.startTime}
                    </p>
                    <p className="text-sm text-muted truncate">{a.reasonForVisit}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <StatusPill status={a.status} />
                    {["REQUESTED", "CONFIRMED"].includes(a.status) && (
                      <Button
                        size="sm"
                        variant="danger"
                        disabled={busyId === a.id}
                        onClick={() => cancel(a.id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}

          <h2 className="font-display text-lg text-foreground mb-3">Past & cancelled</h2>
          {past.length === 0 ? (
            <Card><EmptyState title="Nothing here yet" /></Card>
          ) : (
            <div className="grid gap-3">
              {past.map((a) => (
                <Card key={a.id} className="p-4 flex items-center gap-4 opacity-80">
                  <TokenBadge number={a.tokenNumber} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground text-sm">{a.doctorName}</p>
                    <p className="text-xs text-muted">
                      {a.departmentName} &middot; {a.date} at {a.startTime}
                    </p>
                  </div>
                  <StatusPill status={a.status} />
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
