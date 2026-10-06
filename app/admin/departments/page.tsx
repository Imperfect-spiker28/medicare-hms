"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, Button, Input, Textarea, EmptyState } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { Plus } from "lucide-react";

interface Department {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export default function AdminDepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(() => {
    apiFetch<{ departments: Department[] }>("/api/admin/departments").then((d) => setDepartments(d.departments));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/admin/departments", {
        method: "POST",
        body: JSON.stringify({ name, description }),
      });
      setName("");
      setDescription("");
      setShowForm(false);
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not add department.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl text-foreground">Departments</h1>
        <Button size="sm" onClick={() => setShowForm((s) => !s)}>
          <Plus size={16} /> Add department
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 mb-6 max-w-md">
          <form onSubmit={onSubmit} className="space-y-4">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
            <Textarea label="Description" required rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
            {error && <p className="text-sm text-danger">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Adding…" : "Add department"}
            </Button>
          </form>
        </Card>
      )}

      {departments.length === 0 ? (
        <Card><EmptyState title="No departments yet" /></Card>
      ) : (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
          {departments.map((d) => (
            <Card key={d.id} className="p-5">
              <p className="font-medium text-foreground">{d.name}</p>
              <p className="text-sm text-muted">{d.description}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
