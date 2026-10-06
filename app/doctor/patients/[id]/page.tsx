"use client";

import { useEffect, useState, useCallback, use } from "react";
import { useSearchParams } from "next/navigation";
import { Card, Button, Input, Textarea, StatusPill, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { Plus, Trash2, Printer } from "lucide-react";
import { PrescriptionPrintModal, type PrescriptionData } from "@/components/prescription-print-modal";

interface PatientDetail {
  patient: {
    id: string;
    fullName: string;
    email: string;
    phone: string;
    gender?: string;
    dateOfBirth?: string;
    bloodGroup?: string;
    allergies?: string;
    chronicConditions?: string;
  };
  appointments: {
    id: string;
    date: string;
    startTime: string;
    status: string;
    doctorName?: string;
    departmentName?: string;
    reasonForVisit: string;
  }[];
  notes: { id: string; diagnosis: string; notes: string; createdAt: string; appointmentId: string }[];
  prescriptions: {
    id: string;
    createdAt: string;
    appointmentId: string;
    items: { medicine: string; dosage: string; frequency: string; durationDays: number }[];
  }[];
}

interface RxItem {
  medicine: string;
  dosage: string;
  frequency: string;
  durationDays: number;
}

export default function PatientRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const appointmentId = searchParams.get("appt");

  const [data, setData] = useState<PatientDetail | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");
  const [rxItems, setRxItems] = useState<RxItem[]>([
    { medicine: "", dosage: "", frequency: "", durationDays: 5 },
  ]);
  const [savingNote, setSavingNote] = useState(false);
  const [savingRx, setSavingRx] = useState(false);
  const [message, setMessage] = useState("");
  const [printData, setPrintData] = useState<PrescriptionData | null>(null);

  const load = useCallback(() => {
    apiFetch<PatientDetail>(`/api/patients/${id}`).then(setData);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function saveNote(e: React.FormEvent) {
    e.preventDefault();
    if (!appointmentId) return;
    setSavingNote(true);
    setMessage("");
    try {
      await apiFetch(`/api/appointments/${appointmentId}/notes`, {
        method: "POST",
        body: JSON.stringify({ diagnosis, notes }),
      });
      setDiagnosis("");
      setNotes("");
      setMessage("Consultation note saved.");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save note.");
    } finally {
      setSavingNote(false);
    }
  }

  async function saveRx(e: React.FormEvent) {
    e.preventDefault();
    if (!appointmentId) return;
    setSavingRx(true);
    setMessage("");
    try {
      await apiFetch(`/api/appointments/${appointmentId}/prescription`, {
        method: "POST",
        body: JSON.stringify({ items: rxItems }),
      });
      setRxItems([{ medicine: "", dosage: "", frequency: "", durationDays: 5 }]);
      setMessage("Prescription saved.");
      load();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not save prescription.");
    } finally {
      setSavingRx(false);
    }
  }

  function updateItem(i: number, key: keyof RxItem, value: string | number) {
    setRxItems((items) => items.map((it, idx) => (idx === i ? { ...it, [key]: value } : it)));
  }

  if (!data) return <p className="text-sm text-muted">Loading…</p>;
  const { patient, appointments, notes: allNotes, prescriptions } = data;

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-foreground mb-1">{patient.fullName}</h1>
      <p className="text-sm text-muted mb-6">
        {patient.phone} &middot; {patient.gender || "—"} &middot; DOB {patient.dateOfBirth || "—"}
        {patient.bloodGroup && <> &middot; Blood group {patient.bloodGroup}</>}
      </p>

      {appointmentId && (
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <Card className="p-5">
            <h2 className="font-display text-base text-foreground mb-3">Add consultation note</h2>
            <form onSubmit={saveNote} className="space-y-3">
              <Input
                label="Diagnosis"
                required
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
              />
              <Textarea
                label="Notes"
                required
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <Button type="submit" size="sm" disabled={savingNote}>
                {savingNote ? "Saving…" : "Save note"}
              </Button>
            </form>
          </Card>

          <Card className="p-5">
            <h2 className="font-display text-base text-foreground mb-3">Write prescription</h2>
            <form onSubmit={saveRx} className="space-y-3">
              {rxItems.map((item, i) => (
                <div key={i} className="border border-border rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-muted">Item {i + 1}</span>
                    {rxItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setRxItems((items) => items.filter((_, idx) => idx !== i))}
                        className="text-danger"
                        aria-label="Remove item"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                  <Input
                    placeholder="Medicine"
                    required
                    value={item.medicine}
                    onChange={(e) => updateItem(i, "medicine", e.target.value)}
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Input
                      placeholder="Dosage"
                      required
                      value={item.dosage}
                      onChange={(e) => updateItem(i, "dosage", e.target.value)}
                    />
                    <Input
                      placeholder="Frequency"
                      required
                      value={item.frequency}
                      onChange={(e) => updateItem(i, "frequency", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="Days"
                      required
                      min={1}
                      value={item.durationDays}
                      onChange={(e) => updateItem(i, "durationDays", Number(e.target.value))}
                    />
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() =>
                  setRxItems((items) => [
                    ...items,
                    { medicine: "", dosage: "", frequency: "", durationDays: 5 },
                  ])
                }
              >
                <Plus size={14} /> Add medicine
              </Button>
              <Button type="submit" size="sm" className="w-full" disabled={savingRx}>
                {savingRx ? "Saving…" : "Save prescription"}
              </Button>
            </form>
          </Card>
        </div>
      )}

      {message && <p className="text-sm text-primary mb-6">{message}</p>}

      <h2 className="font-display text-lg text-foreground mb-3">Visit history</h2>
      {appointments.length === 0 ? (
        <Card><EmptyState title="No visits recorded" /></Card>
      ) : (
        <div className="grid gap-3 mb-8">
          {appointments.map((a) => (
            <Card key={a.id} className="p-4">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium text-foreground">
                  {a.date} at {a.startTime} — {a.doctorName}
                </p>
                <StatusPill status={a.status} />
              </div>
              <p className="text-sm text-muted">{a.departmentName} &middot; {a.reasonForVisit}</p>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-display text-lg text-foreground mb-3">Consultation notes</h2>
      {allNotes.length === 0 ? (
        <Card className="mb-8"><EmptyState title="No notes recorded" /></Card>
      ) : (
        <div className="grid gap-3 mb-8">
          {allNotes.map((n) => (
            <Card key={n.id} className="p-4">
              <p className="text-sm font-medium text-foreground">{n.diagnosis}</p>
              <p className="text-sm text-muted">{n.notes}</p>
              <p className="text-xs text-muted mt-1">{new Date(n.createdAt).toLocaleString()}</p>
            </Card>
          ))}
        </div>
      )}

      <h2 className="font-display text-lg text-foreground mb-3">Prescriptions</h2>
      {prescriptions.length === 0 ? (
        <Card><EmptyState title="No prescriptions recorded" /></Card>
      ) : (
        <div className="grid gap-3">
          {prescriptions.map((rx) => {
            const relatedNote = allNotes.find((n) => n.appointmentId === rx.appointmentId);
            const relatedAppt = appointments.find((a) => a.id === rx.appointmentId);
            return (
              <Card key={rx.id} className="p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <ul className="text-sm text-foreground space-y-1 flex-1">
                    {rx.items.map((item, i) => (
                      <li key={i}>
                        {item.medicine} — {item.dosage}, {item.frequency}, {item.durationDays} days
                      </li>
                    ))}
                  </ul>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="gap-1.5"
                    onClick={() =>
                      setPrintData({
                        doctorName: relatedAppt?.doctorName || "Dr. Suresh Nair",
                        doctorDepartment: relatedAppt?.departmentName || "Cardiology",
                        patientName: patient.fullName,
                        patientCode: `MCH-${patient.id.slice(0, 8).toUpperCase()}`,
                        patientPhone: patient.phone,
                        patientGender: patient.gender,
                        patientAgeOrDob: patient.dateOfBirth,
                        date: new Date(rx.createdAt).toLocaleDateString(),
                        diagnosis: relatedNote?.diagnosis,
                        clinicalNotes: relatedNote?.notes,
                        items: rx.items,
                      })
                    }
                  >
                    <Printer size={14} /> Print Rx
                  </Button>
                </div>
                <p className="text-xs text-muted mt-1">{new Date(rx.createdAt).toLocaleString()}</p>
              </Card>
            );
          })}
        </div>
      )}

      {printData && (
        <PrescriptionPrintModal data={printData} onClose={() => setPrintData(null)} />
      )}
    </div>
  );
}
