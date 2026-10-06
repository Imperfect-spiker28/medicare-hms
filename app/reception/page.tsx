"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, Input, Select, Textarea, StatusPill, TokenBadge, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { Search, UserPlus, CalendarPlus, Activity } from "lucide-react";
import { RecordVitalsModal } from "@/components/record-vitals-modal";

interface Appointment {
  id: string;
  tokenNumber: number;
  patientName?: string;
  patientPhone?: string;
  doctorName?: string;
  departmentName?: string;
  startTime: string;
  status: string;
  type: string;
}
interface Patient {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  patientCode?: string;
}
interface Department {
  id: string;
  name: string;
}
interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
}
interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type Tab = "queue" | "walkin" | "book";

export default function ReceptionPage() {
  const [tab, setTab] = useState<Tab>("queue");

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Front desk</h1>
      <div className="flex gap-2 mb-6 border-b border-border">
        {[
          { id: "queue" as Tab, label: "Today's queue" },
          { id: "walkin" as Tab, label: "Register walk-in" },
          { id: "book" as Tab, label: "Book appointment" },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.id ? "border-primary text-primary" : "border-transparent text-muted hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "queue" && <QueueTab />}
      {tab === "walkin" && <WalkinTab onRegistered={() => setTab("book")} />}
      {tab === "book" && <BookTab />}
    </div>
  );
}

function QueueTab() {
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [vitalsAppt, setVitalsAppt] = useState<{ id: string; patientName: string } | null>(null);

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

  async function checkIn(id: string) {
    setBusyId(id);
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status: "CHECKED_IN" }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <div className="mb-4">
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
            <Card key={a.id} className="p-4 flex items-center gap-4 flex-wrap">
              <TokenBadge number={a.tokenNumber} size="sm" />
              <div className="flex-1 min-w-[200px]">
                <p className="font-medium text-foreground text-sm">{a.patientName}</p>
                <p className="text-xs text-muted">
                  {a.doctorName} &middot; {a.departmentName} &middot; {a.startTime}
                </p>
              </div>
              <StatusPill status={a.status} />
              <div className="flex items-center gap-2">
                {a.status === "CONFIRMED" && (
                  <Button size="sm" variant="secondary" disabled={busyId === a.id} onClick={() => checkIn(a.id)}>
                    Check in
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex items-center gap-1.5 text-xs text-primary border border-primary/20 hover:bg-primary/5"
                  onClick={() => setVitalsAppt({ id: a.id, patientName: a.patientName || "Patient" })}
                >
                  <Activity size={14} />
                  Record Vitals
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {vitalsAppt && (
        <RecordVitalsModal
          appointmentId={vitalsAppt.id}
          patientName={vitalsAppt.patientName}
          onClose={() => setVitalsAppt(null)}
          onSaved={() => {
            setVitalsAppt(null);
            load();
          }}
        />
      )}
    </div>
  );
}

function WalkinTab({ onRegistered }: { onRegistered: () => void }) {
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", gender: "", address: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const data = await apiFetch<{ patient: { fullName: string; patientCode: string } }>(
        "/api/reception/walkin",
        { method: "POST", body: JSON.stringify(form) }
      );
      setMessage(`Registered ${data.patient.fullName} — health card ${data.patient.patientCode}`);
      setForm({ fullName: "", phone: "", email: "", gender: "", address: "" });
      onRegistered();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not register patient.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6 max-w-md">
      <div className="flex items-center gap-2 mb-4">
        <UserPlus size={18} className="text-primary" />
        <h2 className="font-display text-lg text-foreground">Register walk-in patient</h2>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <Input label="Full name" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
        <Input label="Phone number" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
        <Input label="Email (optional)" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} />
        <Select label="Gender" value={form.gender} onChange={(e) => update("gender", e.target.value)}>
          <option value="">Not specified</option>
          <option value="MALE">Male</option>
          <option value="FEMALE">Female</option>
          <option value="OTHER">Other</option>
        </Select>
        <Textarea label="Address" rows={2} value={form.address} onChange={(e) => update("address", e.target.value)} />
        {message && <p className="text-sm text-primary">{message}</p>}
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Registering…" : "Register patient"}
        </Button>
      </form>
    </Card>
  );
}

function BookTab() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Patient[]>([]);
  const [selected, setSelected] = useState<Patient | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<{ departments: Department[] }>("/api/departments").then((d) => setDepartments(d.departments));
  }, []);

  useEffect(() => {
    const url = departmentId ? `/api/doctors?departmentId=${departmentId}` : "/api/doctors";
    apiFetch<{ doctors: Doctor[] }>(url).then((d) => setDoctors(d.doctors));
  }, [departmentId]);

  useEffect(() => {
    if (!doctorId || !date) return;
    let ignore = false;
    apiFetch<{ slots: Slot[] }>(`/api/doctors/${doctorId}/slots?date=${date}`).then((d) => {
      if (!ignore) setSlots(d.slots);
    });
    return () => {
      ignore = true;
    };
  }, [doctorId, date]);

  async function search(q: string) {
    setQuery(q);
    if (q.trim().length < 2) return setResults([]);
    const data = await apiFetch<{ patients: Patient[] }>(`/api/patients/search?q=${encodeURIComponent(q)}`);
    setResults(data.patients);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setLoading(true);
    setMessage("");
    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          patientId: selected.id,
          date,
          startTime,
          type: "WALK_IN",
          reasonForVisit: reason,
        }),
      });
      setMessage("Appointment booked.");
      setSelected(null);
      setQuery("");
      setReason("");
      setStartTime("");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Could not book appointment.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Search size={16} className="text-primary" />
          <h2 className="font-display text-base text-foreground">Find patient</h2>
        </div>
        <Input
          placeholder="Search by name, phone, email, or health card"
          value={query}
          onChange={(e) => search(e.target.value)}
        />
        <div className="mt-3 space-y-2">
          {results.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelected(p);
                setResults([]);
                setQuery(p.fullName);
              }}
              className="w-full text-left rounded-xl border border-border p-3 hover:border-primary transition-colors"
            >
              <p className="text-sm font-medium text-foreground">{p.fullName}</p>
              <p className="text-xs text-muted">{p.phone} &middot; {p.patientCode}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="mt-3 rounded-xl bg-primary-tint p-3 text-sm text-primary-dark">
            Booking for <strong>{selected.fullName}</strong>
          </div>
        )}
      </Card>

      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <CalendarPlus size={16} className="text-primary" />
          <h2 className="font-display text-base text-foreground">Appointment details</h2>
        </div>
        <form onSubmit={onSubmit} className="space-y-3">
          <Select label="Department" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)}>
            <option value="">All</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </Select>
          <Select
            label="Doctor"
            required
            value={doctorId}
            onChange={(e) => {
              setDoctorId(e.target.value);
              setStartTime("");
            }}
          >
            <option value="">Select</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>{d.fullName} — {d.specialization}</option>
            ))}
          </Select>
          <label className="block">
            <span className="block text-sm font-medium text-foreground mb-1.5">Date</span>
            <input
              type="date"
              min={todayISO()}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setStartTime("");
              }}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm focus:border-primary outline-none"
            />
          </label>
          {doctorId && (
            <div className="grid grid-cols-4 gap-2">
              {slots.map((s) => (
                <button
                  type="button"
                  key={s.startTime}
                  disabled={!s.available}
                  onClick={() => setStartTime(s.startTime)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium ${
                    startTime === s.startTime
                      ? "bg-primary text-white border-primary"
                      : s.available
                      ? "border-border hover:border-primary"
                      : "border-border text-muted/50 line-through cursor-not-allowed"
                  }`}
                >
                  {s.startTime}
                </button>
              ))}
            </div>
          )}
          <Textarea label="Reason" required rows={2} value={reason} onChange={(e) => setReason(e.target.value)} />
          {message && <p className="text-sm text-primary">{message}</p>}
          <Button type="submit" className="w-full" disabled={!selected || !startTime || loading}>
            {loading ? "Booking…" : "Book appointment"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
