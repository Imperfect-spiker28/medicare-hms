"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { Card, Button, StatusPill, TokenBadge } from "@/components/ui";
import { apiFetch } from "@/lib/api-client";
import {
  CalendarCheck,
  Clock3,
  CheckCircle2,
  Users,
  Play,
  FileText,
  FlaskConical,
  Activity,
  Calendar,
  Filter,
  UserCheck,
  Clock,
  Sparkles,
  Search,
} from "lucide-react";

interface Appointment {
  id: string;
  tokenNumber: number;
  patientId: string;
  patientName?: string;
  patientPhone?: string;
  date: string;
  startTime: string;
  status: string;
  type: string;
  reasonForVisit: string;
}

interface CurrentUser {
  id: string;
  fullName: string;
  role: string;
}

interface DoctorInfo {
  id: string;
  fullName: string;
  specialization: string;
  department?: { id: string; name: string } | null;
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function formatDisplayDate(dateStr: string) {
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

const NEXT_STATUS: Record<string, { label: string; status: string }[]> = {
  CONFIRMED: [{ label: "Start consultation", status: "IN_CONSULTATION" }],
  CHECKED_IN: [{ label: "Start consultation", status: "IN_CONSULTATION" }],
  IN_CONSULTATION: [{ label: "Mark completed", status: "COMPLETED" }],
};

export default function DoctorWorkspacePage() {
  const [date, setDate] = useState(todayISO());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch current user & doctor profile details
  useEffect(() => {
    apiFetch<{ user: CurrentUser }>("/api/auth/me")
      .then(async (res) => {
        if (res?.user?.id) {
          try {
            const docRes = await apiFetch<{ doctors: DoctorInfo[] }>("/api/doctors");
            const found = (docRes.doctors || []).find((d) => d.id === res.user.id);
            if (found) {
              setDoctorInfo(found);
            } else {
              setDoctorInfo({
                id: res.user.id,
                fullName: res.user.fullName,
                specialization: "Consultant Physician",
                department: { id: "1", name: "Clinical Outpatient Care" },
              });
            }
          } catch {
            setDoctorInfo({
              id: res.user.id,
              fullName: res.user.fullName,
              specialization: "Consultant Physician",
            });
          }
        }
      })
      .catch(() => {
        // Fallback placeholder if session fetch is unavailable
      });
  }, []);

  const load = useCallback(() => {
    setLoading(true);
    apiFetch<{ appointments: Appointment[] }>(`/api/appointments?date=${date}`)
      .then((d) => setAppointments(d.appointments || []))
      .catch(() => setAppointments([]))
      .finally(() => setLoading(false));
  }, [date]);

  useEffect(() => {
    let ignore = false;
    apiFetch<{ appointments: Appointment[] }>(`/api/appointments?date=${date}`)
      .then((d) => {
        if (!ignore) setAppointments(d.appointments || []);
      })
      .catch(() => {
        if (!ignore) setAppointments([]);
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, [date]);

  async function updateStatus(id: string, status: string) {
    setBusyId(id);
    try {
      await apiFetch(`/api/appointments/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      load();
    } finally {
      setBusyId(null);
    }
  }

  // Filter and compute statistics from backend data
  const totalCount = appointments.length;
  const waitingCount = appointments.filter((a) => a.status === "CHECKED_IN" || a.status === "CONFIRMED").length;
  const inConsultationCount = appointments.filter((a) => a.status === "IN_CONSULTATION").length;
  const completedCount = appointments.filter((a) => a.status === "COMPLETED").length;

  // Find next actionable patient
  const nextUp = useMemo(() => {
    return (
      appointments.find((a) => a.status === "IN_CONSULTATION") ||
      appointments.find((a) => a.status === "CHECKED_IN") ||
      appointments.find((a) => a.status === "CONFIRMED") ||
      null
    );
  }, [appointments]);

  // Filtered appointment list for the timeline
  const filteredAppointments = useMemo(() => {
    return appointments.filter((a) => {
      const matchesStatus = filterStatus === "ALL" || a.status === filterStatus;
      const matchesSearch =
        !searchQuery ||
        (a.patientName && a.patientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        String(a.tokenNumber).includes(searchQuery) ||
        (a.reasonForVisit && a.reasonForVisit.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesStatus && matchesSearch;
    });
  }, [appointments, filterStatus, searchQuery]);

  const greeting = (() => {
    const hr = new Date().getHours();
    return hr < 12 ? "Good morning" : hr < 17 ? "Good afternoon" : "Good evening";
  })();

  const doctorDisplayName = doctorInfo?.fullName || "Doctor";

  return (
    <div className="space-y-8">
      {/* Workspace Header: Doctor ID & Daily Context */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 pb-6 border-b border-border/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
            <span className="text-primary font-bold">Medicare Hospital</span>
            <span>&middot;</span>
            <span>Doctor Workspace</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-foreground font-normal tracking-tight">
            {greeting}, {doctorDisplayName.startsWith("Dr.") ? doctorDisplayName : `Dr. ${doctorDisplayName}`}
          </h1>
          <p className="text-sm text-muted mt-1 flex items-center gap-2">
            <span>Your clinic at a glance</span>
            <span>&middot;</span>
            <span className="font-medium text-foreground">{formatDisplayDate(date)}</span>
            {doctorInfo?.specialization && (
              <>
                <span>&middot;</span>
                <span className="text-terracotta font-medium">{doctorInfo.specialization}</span>
              </>
            )}
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto bg-surface border border-border rounded-xl p-1.5 shadow-2xs">
          <Calendar size={15} className="text-muted ml-2" />
          <span className="text-xs font-medium text-muted">Clinic Date:</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg bg-surface-cream px-3 py-1.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer border-0"
          />
        </div>
      </div>

      {/* Primary Metrics Row (Derived strictly from live appointments) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Appointments</p>
            <p className="font-editorial text-3xl text-foreground font-normal leading-none">
              {loading ? "—" : totalCount}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Total scheduled</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <Users size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Waiting</p>
            <p className="font-editorial text-3xl text-terracotta font-normal leading-none">
              {loading ? "—" : waitingCount}
            </p>
            <p className="text-[11px] text-muted mt-1.5">In waiting area</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-surface-cream text-terracotta flex items-center justify-center shrink-0">
            <Clock3 size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">In Chamber</p>
            <p className="font-editorial text-3xl text-primary font-normal leading-none">
              {loading ? "—" : inConsultationCount}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Active consults</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary-tint text-primary flex items-center justify-center shrink-0">
            <Activity size={18} />
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-5 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Completed</p>
            <p className="font-editorial text-3xl text-emerald-700 font-normal leading-none">
              {loading ? "—" : completedCount}
            </p>
            <p className="text-[11px] text-muted mt-1.5">Concluded visits</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
            <CheckCircle2 size={18} />
          </div>
        </div>
      </div>

      {/* Main Clinical Canvas: 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 8 Cols: Live Appointment Timeline & Queue */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <h2 className="font-editorial text-2xl text-foreground font-normal">Today&apos;s patient queue</h2>
              <p className="text-xs text-muted">Chronological clinical consult schedule</p>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={14} className="text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter name / token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-lg border border-border bg-surface text-xs text-foreground placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary w-40 sm:w-48"
                />
              </div>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
              >
                <option value="ALL">All status</option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="CHECKED_IN">Waiting (Checked in)</option>
                <option value="IN_CONSULTATION">In Chamber</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          {/* Timeline List or Useful Empty State */}
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-surface border border-border rounded-2xl p-5 animate-pulse flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-border/60" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-40 rounded bg-border/60" />
                    <div className="h-3 w-60 rounded bg-border/40" />
                  </div>
                  <div className="h-8 w-24 rounded-lg bg-border/50" />
                </div>
              ))}
            </div>
          ) : appointments.length === 0 ? (
            /* Purposeful, useful empty state when zero appointments exist */
            <div className="bg-surface border border-dashed border-border rounded-3xl p-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-surface-cream border border-border/80 text-primary flex items-center justify-center mx-auto mb-4 shadow-2xs">
                <CalendarCheck size={28} />
              </div>
              <h3 className="font-editorial text-xl text-foreground font-normal mb-1">Your clinic starts here</h3>
              <p className="text-sm text-muted max-w-md mx-auto mb-6 leading-relaxed">
                No patient consultations scheduled for {formatDisplayDate(date)}. Patient bookings, front-desk check-ins, and walk-in arrivals will appear here dynamically.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <button
                  onClick={() => setDate(todayISO())}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-medium hover:bg-primary-dark transition-colors cursor-pointer"
                >
                  Switch to today
                </button>
                <Link href="/doctor">
                  <button
                    onClick={load}
                    className="px-4 py-2 rounded-xl bg-surface border border-border text-foreground text-xs font-medium hover:bg-surface-cream transition-colors cursor-pointer"
                  >
                    Refresh queue
                  </button>
                </Link>
              </div>
            </div>
          ) : filteredAppointments.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center text-muted text-sm">
              No consultations match your filter criteria.
            </div>
          ) : (
            /* Appointment Timeline Cards */
            <div className="space-y-3">
              {filteredAppointments.map((a) => {
                const isConsulting = a.status === "IN_CONSULTATION";
                return (
                  <div
                    key={a.id}
                    className={`bg-surface border rounded-2xl p-5 transition-all shadow-2xs hover:shadow-sm ${
                      isConsulting
                        ? "border-primary ring-1 ring-primary/30 bg-primary-tint/20"
                        : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Token & Patient Metadata */}
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center">
                          <TokenBadge number={a.tokenNumber} size="md" />
                          <span className="text-[10px] text-muted font-medium mt-1 uppercase tracking-wider">
                            Token
                          </span>
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <Link
                              href={`/doctor/patients/${a.patientId}?appt=${a.id}`}
                              className="font-display font-bold text-base text-foreground hover:text-primary transition-colors hover:underline"
                            >
                              {a.patientName || "Patient"}
                            </Link>
                            <StatusPill status={a.status} />
                            {a.type === "WALK_IN" && (
                              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-surface-cream border border-border text-muted">
                                Walk-in
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-xs text-muted mt-1.5 flex-wrap">
                            <span className="flex items-center gap-1 font-medium text-foreground">
                              <Clock size={13} className="text-primary" />
                              {a.startTime}
                            </span>
                            {a.patientPhone && (
                              <>
                                <span>&middot;</span>
                                <span>{a.patientPhone}</span>
                              </>
                            )}
                          </div>

                          {a.reasonForVisit && (
                            <p className="text-xs text-muted mt-2 italic line-clamp-1 bg-surface-cream/50 px-2.5 py-1 rounded-md border border-border/50">
                              &ldquo;{a.reasonForVisit}&rdquo;
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Clinical Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        {(NEXT_STATUS[a.status] || []).map((opt) => (
                          <Button
                            key={opt.status}
                            size="sm"
                            disabled={busyId === a.id}
                            onClick={() => updateStatus(a.id, opt.status)}
                            className={
                              opt.status === "IN_CONSULTATION"
                                ? "bg-primary hover:bg-primary-dark text-white shadow-xs"
                                : "bg-emerald-700 hover:bg-emerald-800 text-white"
                            }
                          >
                            {opt.status === "IN_CONSULTATION" && <Play size={13} className="mr-1 fill-current" />}
                            {opt.label}
                          </Button>
                        ))}

                        <Link href={`/doctor/patients/${a.patientId}?appt=${a.id}`}>
                          <Button variant="secondary" size="sm" className="border-border text-foreground">
                            Clinical Record &rarr;
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 4 Cols: Quick Clinical Actions & Next Up Focus */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active / Next Consultation Focus Card */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-border/70">
              <span className="text-xs font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                <Sparkles size={13} /> Immediate Priority
              </span>
              <span className="text-[11px] text-muted">In Queue</span>
            </div>

            {nextUp ? (
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <TokenBadge number={nextUp.tokenNumber} size="sm" />
                  <div>
                    <p className="font-display font-bold text-base text-foreground leading-tight">
                      {nextUp.patientName || "Patient"}
                    </p>
                    <p className="text-xs text-muted mt-0.5">
                      Scheduled: {nextUp.startTime} &middot; <StatusPill status={nextUp.status} />
                    </p>
                  </div>
                </div>

                {nextUp.reasonForVisit && (
                  <p className="text-xs text-muted mb-4 bg-surface-cream p-2.5 rounded-lg border border-border">
                    <span className="font-semibold text-foreground">Chief complaint:</span> {nextUp.reasonForVisit}
                  </p>
                )}

                <div className="space-y-2">
                  {nextUp.status !== "IN_CONSULTATION" && (
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary-dark text-white justify-center"
                      disabled={busyId === nextUp.id}
                      onClick={() => updateStatus(nextUp.id, "IN_CONSULTATION")}
                    >
                      <Play size={13} className="mr-1 fill-current" /> Call Into Chamber
                    </Button>
                  )}
                  <Link href={`/doctor/patients/${nextUp.patientId}?appt=${nextUp.id}`} className="block w-full">
                    <Button variant="secondary" size="sm" className="w-full justify-center border-border">
                      Open Clinical Record &rarr;
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-6 text-center">
                <UserCheck size={28} className="text-muted mx-auto mb-2" />
                <p className="text-xs font-medium text-foreground">Chamber is clear</p>
                <p className="text-[11px] text-muted mt-0.5">No patients currently queued for consultation.</p>
              </div>
            )}
          </div>

          {/* Direct Clinical Workflow Tooling */}
          <div className="bg-surface rounded-2xl border border-border p-5 shadow-2xs">
            <h3 className="font-display font-semibold text-sm text-foreground mb-3">Clinical Workflow Access</h3>
            <p className="text-xs text-muted mb-4 leading-relaxed">
              Open active patient charts to record consultation findings, issue electronic prescriptions, or order in-house pathology and radiology investigations.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-surface-cream/70 border border-border/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-tint text-primary flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Consultation Notes & Rx</p>
                  <p className="text-[11px] text-muted">Diagnosis, vitals, structured medication dosage and duration.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-cream/70 border border-border/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-surface-cream text-terracotta flex items-center justify-center shrink-0 mt-0.5">
                  <FlaskConical size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Laboratory Investigations</p>
                  <p className="text-[11px] text-muted">Order CBC, Lipid Panels, HbA1c, and review technician results.</p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-surface-cream/70 border border-border/80 flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                  <Activity size={16} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">Patient Vitals History</p>
                  <p className="text-[11px] text-muted">Pre-consultation BP, SpO2, Temperature, and Pulse tracking.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Hospital Guidelines / Quick Reference */}
          <div className="rounded-2xl border border-border/80 bg-surface-cream/50 p-4 text-xs text-muted space-y-2">
            <p className="font-semibold text-foreground text-xs">Standard Consultation Pace</p>
            <p className="text-[11px] leading-relaxed">
              Consultation slots are standardized at 15 minutes. Mark consultation completed upon issuing digital Rx to call the next waiting token.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}
