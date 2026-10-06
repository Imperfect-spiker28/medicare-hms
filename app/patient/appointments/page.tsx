"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, StatusPill, TokenBadge, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { Printer, Receipt } from "lucide-react";
import { PrescriptionPrintModal, type PrescriptionData } from "@/components/prescription-print-modal";
import { ConsultationReceiptModal, type ConsultationBillData } from "@/components/consultation-receipt-modal";

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
  const [printData, setPrintData] = useState<PrescriptionData | null>(null);
  const [receiptBill, setReceiptBill] = useState<ConsultationBillData | null>(null);
  const [receiptLoadingId, setReceiptLoadingId] = useState<string | null>(null);

  async function loadReceipt(appointmentId: string) {
    setReceiptLoadingId(appointmentId);
    try {
      const res = await apiFetch<{ bill: ConsultationBillData }>(`/api/billing/appointments/${appointmentId}`);
      setReceiptBill(res.bill);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Receipt not found.");
    } finally {
      setReceiptLoadingId(null);
    }
  }

  async function loadPrescription(a: Appointment) {
    try {
      const [rxRes, noteRes] = await Promise.all([
        apiFetch<{ prescriptions: Array<{ items: Array<{ medicine: string; dosage: string; frequency: string; durationDays: number; instructions?: string }> }> }>(`/api/appointments/${a.id}/prescription`),
        apiFetch<{ notes: Array<{ diagnosis?: string; notes?: string }> }>(`/api/appointments/${a.id}/notes`).catch(() => ({ notes: [] })),
      ]);
      const rx = rxRes.prescriptions?.[0];
      if (!rx || !rx.items?.length) {
        alert("No prescription recorded for this visit yet.");
        return;
      }
      const note = noteRes.notes?.[0];
      setPrintData({
        doctorName: a.doctorName || "Medicare Doctor",
        doctorDepartment: a.departmentName,
        patientName: "Patient",
        date: a.date,
        tokenNumber: a.tokenNumber,
        diagnosis: note?.diagnosis,
        clinicalNotes: note?.notes,
        items: rx.items,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : "Could not load prescription.");
    }
  }

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
                <Card key={a.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <TokenBadge number={a.tokenNumber} size="sm" />
                    <div className="sm:hidden flex-1 flex justify-end">
                      <StatusPill status={a.status} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{a.doctorName}</p>
                    <p className="text-xs sm:text-sm text-muted">
                      {a.departmentName} &middot; {a.date} at {a.startTime}
                    </p>
                    <p className="text-xs sm:text-sm text-muted mt-0.5 truncate">{a.reasonForVisit}</p>
                  </div>
                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    <div className="hidden sm:block">
                      <StatusPill status={a.status} />
                    </div>
                    <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted hover:text-foreground border border-border gap-1"
                        disabled={receiptLoadingId === a.id}
                        onClick={() => loadReceipt(a.id)}
                      >
                        <Receipt size={13} /> {receiptLoadingId === a.id ? "Loading…" : "Receipt"}
                      </Button>
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
                <Card key={a.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 opacity-90 hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-3">
                    <TokenBadge number={a.tokenNumber} size="sm" />
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground text-sm">{a.doctorName}</p>
                      <p className="text-xs text-muted">
                        {a.departmentName} &middot; {a.date} at {a.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                    <StatusPill status={a.status} />
                    <div className="flex items-center gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-xs text-muted hover:text-foreground border border-border gap-1"
                        disabled={receiptLoadingId === a.id}
                        onClick={() => loadReceipt(a.id)}
                      >
                        <Receipt size={13} /> {receiptLoadingId === a.id ? "Loading…" : "Receipt"}
                      </Button>
                      {a.status === "COMPLETED" && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="gap-1.5"
                          onClick={() => loadPrescription(a)}
                        >
                          <Printer size={14} /> Prescription
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {printData && (
        <PrescriptionPrintModal data={printData} onClose={() => setPrintData(null)} />
      )}

      {receiptBill && (
        <ConsultationReceiptModal bill={receiptBill} onClose={() => setReceiptBill(null)} />
      )}
    </div>
  );
}
