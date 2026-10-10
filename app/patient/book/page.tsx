"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, Button, Select, Textarea } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";

interface Department {
  id: string;
  name: string;
}
interface Doctor {
  id: string;
  fullName: string;
  specialization: string;
  consultationFee: number;
  department: { id: string; name: string } | null;
}
interface Slot {
  startTime: string;
  endTime: string;
  available: boolean;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function BookAppointmentPage() {
  const router = useRouter();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [departmentId, setDepartmentId] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(todayISO());
  const [slots, setSlots] = useState<Slot[]>([]);
  const [startTime, setStartTime] = useState("");
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);

  useEffect(() => {
    let ignore = false;
    Promise.all([
      apiFetch<{ departments: Department[] }>("/api/departments").catch(() => ({ departments: [] })),
      apiFetch<{ doctors: Doctor[] }>("/api/doctors").catch(() => ({ doctors: [] })),
    ]).then(([deptData, docData]) => {
      if (ignore) return;
      setDepartments(deptData.departments || []);
      setDoctors(docData.doctors || []);
    });
    return () => {
      ignore = true;
    };
  }, []);

  useEffect(() => {
    if (!departmentId) return;
    let ignore = false;
    apiFetch<{ doctors: Doctor[] }>(`/api/doctors?departmentId=${departmentId}`)
      .then((d) => {
        if (!ignore) setDoctors(d.doctors || []);
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [departmentId]);

  useEffect(() => {
    if (!doctorId || !date) return;
    let ignore = false;
    apiFetch<{ slots: Slot[] }>(`/api/doctors/${doctorId}/slots?date=${date}`)
      .then((d) => {
        if (!ignore) setSlots(d.slots);
      })
      .finally(() => {
        if (!ignore) setSlotsLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [doctorId, date]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/appointments", {
        method: "POST",
        body: JSON.stringify({
          doctorId,
          date,
          startTime,
          type: "ONLINE",
          reasonForVisit: reason,
        }),
      });
      setSuccess(true);
      setTimeout(() => router.push("/patient/appointments"), 1200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not book appointment.");
    } finally {
      setLoading(false);
    }
  }

  const selectedDoctor = doctors.find((d) => d.id === doctorId);

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-2xl text-foreground mb-1">Book an appointment</h1>
      <p className="text-sm text-muted mb-6">
        Choose a department and doctor, then pick an open slot.
      </p>

      <Card className="p-6">
        <form onSubmit={onSubmit} className="space-y-5">
          <Select
            label="Department"
            value={departmentId}
            onChange={(e) => {
              setDepartmentId(e.target.value);
              setDoctorId("");
              setSlots([]);
              setStartTime("");
            }}
          >
            <option value="">All departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </Select>

          <Select
            label="Doctor"
            required
            value={doctorId}
            onChange={(e) => setDoctorId(e.target.value)}
          >
            <option value="">Select a doctor</option>
            {doctors.map((d) => (
              <option key={d.id} value={d.id}>
                {d.fullName} — {d.specialization} (₹{d.consultationFee})
              </option>
            ))}
          </Select>
          {selectedDoctor && (
            <p className="text-xs text-muted -mt-3">
              {selectedDoctor.department?.name} &middot; Consultation fee ₹{selectedDoctor.consultationFee}
            </p>
          )}

          <label className="block">
            <span className="block text-sm font-medium text-foreground mb-1.5">Date</span>
            <input
              type="date"
              required
              min={todayISO()}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground focus:border-primary outline-none"
            />
          </label>

          {doctorId && (
            <div>
              <span className="block text-sm font-medium text-foreground mb-1.5">
                Available time slots
              </span>
              {slotsLoading ? (
                <p className="text-sm text-muted">Loading slots…</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted">
                  This doctor isn&apos;t available on the selected date. Try another day.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map((s) => (
                    <button
                      type="button"
                      key={s.startTime}
                      disabled={!s.available}
                      onClick={() => setStartTime(s.startTime)}
                      className={`rounded-lg border px-2 py-2 text-xs font-medium transition-colors ${
                        startTime === s.startTime
                          ? "bg-primary text-white border-primary"
                          : s.available
                          ? "border-border text-foreground hover:border-primary"
                          : "border-border text-muted/50 line-through cursor-not-allowed bg-background"
                      }`}
                    >
                      {s.startTime}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <Textarea
            label="Reason for visit"
            required
            rows={3}
            placeholder="Briefly describe your symptoms or reason for the visit"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {error && <p className="text-sm text-danger">{error}</p>}
          {success && <p className="text-sm text-success">Appointment booked! Redirecting…</p>}

          <Button type="submit" className="w-full" disabled={!startTime || loading}>
            {loading ? "Booking…" : "Confirm appointment"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
