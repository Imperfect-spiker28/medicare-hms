"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, Input, Select, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { Plus } from "lucide-react";

interface Department {
  id: string;
  name: string;
}
interface DoctorRow {
  userId: string;
  fullName?: string;
  email?: string;
  isActive?: boolean;
  departmentName?: string;
  specialization: string;
  consultationFee: number;
  yearsExperience: number;
}

const emptyForm = {
  fullName: "",
  email: "",
  phone: "",
  password: "",
  departmentId: "",
  specialization: "",
  qualification: "",
  registrationNo: "",
  consultationFee: "",
  yearsExperience: "",
};

export default function AdminDoctorsPage() {
  const [doctors, setDoctors] = useState<DoctorRow[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(() => {
    apiFetch<{ doctors: DoctorRow[] }>("/api/admin/doctors").then((d) => setDoctors(d.doctors));
  }, []);

  useEffect(() => {
    load();
    apiFetch<{ departments: Department[] }>("/api/departments").then((d) => setDepartments(d.departments));
  }, [load]);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/admin/doctors", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          consultationFee: Number(form.consultationFee),
          yearsExperience: Number(form.yearsExperience),
        }),
      });
      setForm(emptyForm);
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add doctor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Doctors</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Add doctor
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 mb-6 max-w-2xl">
          <form onSubmit={onSubmit} className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name" required value={form.fullName} onChange={(e) => update("fullName", e.target.value)} />
            <Input label="Email" type="email" required value={form.email} onChange={(e) => update("email", e.target.value)} />
            <Input label="Phone" required value={form.phone} onChange={(e) => update("phone", e.target.value)} />
            <Input label="Temporary password" type="password" required minLength={8} value={form.password} onChange={(e) => update("password", e.target.value)} />
            <Select label="Department" required value={form.departmentId} onChange={(e) => update("departmentId", e.target.value)}>
              <option value="">Select</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </Select>
            <Input label="Specialization" required value={form.specialization} onChange={(e) => update("specialization", e.target.value)} />
            <Input label="Qualification" required value={form.qualification} onChange={(e) => update("qualification", e.target.value)} />
            <Input label="Registration no." required value={form.registrationNo} onChange={(e) => update("registrationNo", e.target.value)} />
            <Input label="Consultation fee (₹)" type="number" required value={form.consultationFee} onChange={(e) => update("consultationFee", e.target.value)} />
            <Input label="Years of experience" type="number" required value={form.yearsExperience} onChange={(e) => update("yearsExperience", e.target.value)} />
            {error && <p className="text-sm text-danger sm:col-span-2">{error}</p>}
            <Button type="submit" className="sm:col-span-2" disabled={loading}>
              {loading ? "Adding…" : "Add doctor"}
            </Button>
          </form>
        </Card>
      )}

      {doctors.length === 0 ? (
        <Card><EmptyState title="No doctors yet" /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {doctors.map((d) => (
            <Card key={d.userId} className="p-5">
              <p className="font-medium text-foreground">{d.fullName}</p>
              <p className="text-sm text-accent-dark">{d.specialization}</p>
              <p className="text-sm text-muted">{d.departmentName}</p>
              <p className="text-xs text-muted mt-2">
                ₹{d.consultationFee} &middot; {d.yearsExperience} yrs &middot; {d.email}
              </p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
