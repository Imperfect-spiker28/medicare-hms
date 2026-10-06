"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { Users, Stethoscope, Building2, CalendarClock } from "lucide-react";

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  todaysAppointmentCount: number;
  statusCounts: Record<string, number>;
  byDepartment: { department: string; appointments: number; doctors: number }[];
  last7Days: { date: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/api/admin/stats").then(setStats);
  }, []);

  if (!stats) return <p className="text-sm text-muted">Loading…</p>;

  const maxCount = Math.max(...stats.last7Days.map((d) => d.count), 1);

  return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Hospital dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatCard icon={<Users size={18} />} label="Patients" value={stats.totalPatients} />
        <StatCard icon={<Stethoscope size={18} />} label="Doctors" value={stats.totalDoctors} />
        <StatCard icon={<Building2 size={18} />} label="Departments" value={stats.totalDepartments} />
        <StatCard icon={<CalendarClock size={18} />} label="Today's appointments" value={stats.todaysAppointmentCount} />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="p-5">
          <h2 className="font-display text-base text-foreground mb-4">Appointments, last 7 days</h2>
          <div className="flex items-end gap-2 h-32">
            {stats.last7Days.map((d) => (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-primary rounded-t-md"
                  style={{ height: `${(d.count / maxCount) * 100}%`, minHeight: d.count ? 4 : 1 }}
                />
                <span className="text-[10px] text-muted">{d.date.slice(5)}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="font-display text-base text-foreground mb-4">Appointment status</h2>
          <div className="space-y-2">
            {Object.entries(stats.statusCounts).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between text-sm">
                <span className="text-muted">{status.replace("_", " ")}</span>
                <span className="font-medium text-foreground">{count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="p-5">
        <h2 className="font-display text-base text-foreground mb-4">By department</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stats.byDepartment.map((d) => (
            <div key={d.department} className="border border-border rounded-xl p-3">
              <p className="text-sm font-medium text-foreground">{d.department}</p>
              <p className="text-xs text-muted">{d.doctors} doctors &middot; {d.appointments} appointments</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card className="p-5">
      <div className="w-9 h-9 rounded-lg bg-primary-tint text-primary flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="font-display text-2xl text-foreground">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </Card>
  );
}
