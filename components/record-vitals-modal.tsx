"use client";

import { useState } from "react";
import { Activity, X } from "lucide-react";
import { Button, Input } from "./ui";
import { apiFetch } from "@/lib/api-client";

export function RecordVitalsModal({
  appointmentId,
  patientName,
  onClose,
  onSaved,
}: {
  appointmentId: string;
  patientName: string;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [bloodPressure, setBloodPressure] = useState("120/80");
  const [heartRate, setHeartRate] = useState<number | "">(72);
  const [temperature, setTemperature] = useState<number | "">(98.4);
  const [spo2, setSpo2] = useState<number | "">(98);
  const [weightKg, setWeightKg] = useState<number | "">(65.0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch(`/api/appointments/${appointmentId}/vitals`, {
        method: "POST",
        body: JSON.stringify({
          bloodPressure: bloodPressure.trim(),
          heartRate: heartRate !== "" ? Number(heartRate) : null,
          temperature: temperature !== "" ? Number(temperature) : null,
          spo2: spo2 !== "" ? Number(spo2) : null,
          weightKg: weightKg !== "" ? Number(weightKg) : null,
        }),
      });
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to record vitals.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-border">
          <div className="flex items-center gap-2 text-foreground font-display font-semibold">
            <Activity size={20} className="text-primary" /> Record Clinical Vitals
          </div>
          <button
            onClick={onClose}
            className="p-1 text-muted hover:text-foreground rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-muted mb-4">
          Recording vitals for <strong>{patientName}</strong> before doctor consultation.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <Input
            label="Blood Pressure (mmHg)"
            placeholder="e.g. 120/80"
            required
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Pulse (BPM)"
              type="number"
              placeholder="e.g. 72"
              value={heartRate}
              onChange={(e) => setHeartRate(e.target.value ? Number(e.target.value) : "")}
            />

            <Input
              label="SpO2 (%)"
              type="number"
              placeholder="e.g. 98"
              value={spo2}
              onChange={(e) => setSpo2(e.target.value ? Number(e.target.value) : "")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Temperature (°F)"
              type="number"
              step="0.1"
              placeholder="e.g. 98.6"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value ? Number(e.target.value) : "")}
            />

            <Input
              label="Weight (kg)"
              type="number"
              step="0.5"
              placeholder="e.g. 68.0"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value ? Number(e.target.value) : "")}
            />
          </div>

          {error && <p className="text-xs text-danger">{error}</p>}

          <div className="flex gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose} className="w-1/2">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="w-1/2">
              {loading ? "Saving…" : "Save Vitals"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
