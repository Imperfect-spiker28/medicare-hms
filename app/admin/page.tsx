"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import { Users, Stethoscope, Building2, CalendarClock, TrendingUp, ArrowRight } from "lucide-react";

interface Stats {
  totalPatients: number;
  totalDoctors: number;
  totalDepartments: number;
  todaysAppointmentCount: number;
  statusCounts: Record<string, number>;
  byDepartment: { department: string; appointments: number; doctors: number }[];
  last7Days: { date: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  CONFIRMED: "bg-primary-tint text-primary-dark",
  CHECKED_IN: "bg-accent-tint text-accent-dark",
  IN_CONSULTATION: "bg-warning-tint text-warning",
  COMPLETED: "bg-success-tint text-success",
  CANCELLED: "bg-danger-tint text-danger",
  NO_SHOW: "bg-danger-tint text-danger",
  REQUESTED: "bg-warning-tint text-warning",
};

function Skeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-pulse">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="p-5">
          <div className="w-9 h-9 rounded-lg bg-border mb-3" />
          <div className="h-7 w-16 rounded bg-border mb-1" />
          <div className="h-3 w-20 rounded bg-border" />
        </Card>
      ))}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiFetch<Stats>("/api/admin/stats").then(setStats);
  }, []);

  if (!stats) return (
    <div>
      <h1 className="font-display text-2xl text-foreground mb-6">Hospital dashboard</h1>
      <Skeleton />
    </div>
  );

  const maxCount = Math.max(...stats.last7Days.map((d) => d.count), 1);

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl text-foreground">Hospital dashboard</h1>
          <p className="text-sm text-muted mt-0.5">Real-time overview of hospital operations</p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/doctors">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-surface text-sm font-medium text-foreground hover:bg-primary-tint hover:text-primary-dark transition-colors cursor-pointer">
              <Stethoscope size={14} /> Manage doctors <ArrowRight size={13} />
            </button>
          </Link>
          <Link href="/admin/departments">
            <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-border bg-surface text-sm font-medium text-foreground hover:bg-primary-tint hover:text-primary-dark transition-colors cursor-pointer">
              <Building2 size={14} /> Departments <ArrowRight size={13} />
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: <Users size={18} />, label: "Total patients", value: stats.totalPatients, color: "bg-primary-tint text-primary" },
          { icon: <Stethoscope size={18} />, label: "Doctors on staff", value: stats.totalDoctors, color: "bg-success-tint text-success" },
          { icon: <Building2 size={18} />, label: "Departments", value: stats.totalDepartments, color: "bg-accent-tint text-accent-dark" },
          { icon: <CalendarClock size={18} />, label: "Today's appointments", value: stats.todaysAppointmentCount, color: "bg-warning-tint text-warning" },
        ].map((s) => (
          <Card key={s.label} className="p-5 hover:shadow-md transition-shadow">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
              {s.icon}
            </div>
            <p className="font-display text-2xl text-foreground">{s.value}</p>
            <p className="text-xs text-muted">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Bar chart — last 7 days */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={16} className="text-primary" />
            <h2 className="font-display text-base text-foreground">Appointments, last 7 days</h2>
          </div>
          <div className="flex items-end gap-2 h-36">
            {stats.last7Days.map((d) => {
              const pct = (d.count / maxCount) * 100;
              const isToday = d.date === new Date().toISOString().slice(0, 10);
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group">
                  {d.count > 0 && (
                    <span className="text-[10px] font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      {d.count}
                    </span>
                  )}
                  <div
                    className={`w-full rounded-t-md transition-all ${isToday ? "bg-primary" : "bg-primary opacity-40 hover:opacity-70"}`}
                    style={{ height: `${pct}%`, minHeight: d.count ? 6 : 2 }}
                    title={`${d.date}: ${d.count} appointments`}
                  />
                  <span className={`text-[10px] ${isToday ? "text-primary font-semibold" : "text-muted"}`}>
                    {d.date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Appointment status breakdown */}
        <Card className="p-5">
          <h2 className="font-display text-base text-foreground mb-4">Status breakdown</h2>
          <div className="space-y-2">
            {Object.entries(stats.statusCounts)
              .sort(([, a], [, b]) => b - a)
              .map(([status, count]) => {
                const total = Object.values(stats.statusCounts).reduce((a, b) => a + b, 0) || 1;
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLORS[status] || "bg-primary-tint text-primary-dark"}`}>
                        {status.replace(/_/g, " ")}
                      </span>
                      <span className="font-medium text-foreground">{count}</span>
                    </div>
                    <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </Card>
      </div>

      {/* By department */}
      <Card className="p-5">
        <h2 className="font-display text-base text-foreground mb-4">By department</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {stats.byDepartment.map((d) => (
            <div key={d.department} className="border border-border rounded-xl p-3 hover:border-primary hover:bg-primary-tint transition-colors cursor-default">
              <p className="text-sm font-medium text-foreground">{d.department}</p>
              <p className="text-xs text-muted mt-0.5">
                <span className="text-foreground font-medium">{d.doctors}</span> doctors &middot;{" "}
                <span className="text-foreground font-medium">{d.appointments}</span> appointments
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
